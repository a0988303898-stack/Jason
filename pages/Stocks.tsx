import React, { useState, useEffect } from 'react';
import { User, StockPosition } from '../types';
import { getStocks, saveStock, removeStock } from '../services/storageService';
import { fetchStockPrice } from '../services/geminiService';
import Button from '../components/Button';
import Modal from '../components/Modal';

interface StocksProps {
  user: User;
}

const Stocks: React.FC<StocksProps> = ({ user }) => {
  const [stocks, setStocks] = useState<StockPosition[]>([]);
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateAllLoading, setIsUpdateAllLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [symbol, setSymbol] = useState('');
  const [shares, setShares] = useState('');
  const [avgCost, setAvgCost] = useState('');

  const refreshStocks = async () => {
    setLoading(true);
    const data = await getStocks(user.id);
    setStocks(data);
    setLoading(false);
  };

  useEffect(() => {
    refreshStocks();
  }, [user.id]);

  const updatePrice = async (stock: StockPosition) => {
    setLoadingMap(prev => ({ ...prev, [stock.id]: true }));
    const result = await fetchStockPrice(stock.symbol);
    if (result) {
        const updated = { ...stock, currentPrice: result.price, lastUpdated: new Date().toISOString() };
        if(result.name && result.name !== stock.name) updated.name = result.name;
        await saveStock(updated);
        // Optimistic update locally or fetch fresh
        setStocks(prev => prev.map(s => s.id === stock.id ? updated : s));
    } else {
        alert(`Could not fetch data for ${stock.symbol}`);
    }
    setLoadingMap(prev => ({ ...prev, [stock.id]: false }));
  };

  const updateAllPrices = async () => {
    setIsUpdateAllLoading(true);
    for (const stock of stocks) {
        await updatePrice(stock);
    }
    setIsUpdateAllLoading(false);
  }

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || !shares || !avgCost) return;
    setSubmitting(true);

    // Try to get initial price/name
    const initialFetch = await fetchStockPrice(symbol);
    
    const newStock: StockPosition = {
        id: crypto.randomUUID(),
        userId: user.id,
        symbol: symbol.toUpperCase(),
        name: initialFetch?.name || symbol.toUpperCase(),
        shares: Number(shares),
        avgCost: Number(avgCost),
        currentPrice: initialFetch?.price || Number(avgCost),
        lastUpdated: new Date().toISOString()
    };

    await saveStock(newStock);
    setSubmitting(false);
    setIsModalOpen(false);
    refreshStocks();
    setSymbol('');
    setShares('');
    setAvgCost('');
  };

  const handleDelete = async (id: string) => {
      if(confirm('Remove this stock from portfolio?')) {
          await removeStock(id);
          refreshStocks();
      }
  }

  if (loading && stocks.length === 0) {
      return <div className="text-center p-8 text-gray-500">Loading portfolio...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">Stock Portfolio</h2>
            <p className="text-sm text-gray-500">Track your investments and real-time market value</p>
        </div>
        <div className="flex space-x-2">
            <Button variant="secondary" onClick={updateAllPrices} isLoading={isUpdateAllLoading} disabled={stocks.length === 0}>
                <i className="fas fa-sync-alt mr-2"></i> Update All
            </Button>
            <Button onClick={() => setIsModalOpen(true)}>
                <i className="fas fa-plus mr-2"></i> Add Stock
            </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Shares</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Cost</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Market Price</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Market Value</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">P/L</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stocks.map((stock) => {
                  const marketValue = stock.shares * stock.currentPrice;
                  const costBasis = stock.shares * stock.avgCost;
                  const profit = marketValue - costBasis;
                  const profitPercent = costBasis !== 0 ? (profit / costBasis) * 100 : 0;
                  
                  return (
                    <tr key={stock.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                            <span className="font-bold text-gray-900">{stock.symbol}</span>
                            <span className="text-xs text-gray-500">{stock.name}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">{stock.shares}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">${stock.avgCost.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        ${stock.currentPrice.toFixed(2)}
                        <div className="text-xs text-gray-400">
                            {new Date(stock.lastUpdated).toLocaleTimeString()}
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                        ${marketValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {profit >= 0 ? '+' : ''}{profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        <br/>
                        <span className="text-xs">({profitPercent.toFixed(2)}%)</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                        <button 
                            onClick={() => updatePrice(stock)} 
                            disabled={loadingMap[stock.id]} 
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                            title="Update Price with AI"
                        >
                            <i className={`fas fa-sync ${loadingMap[stock.id] ? 'fa-spin' : ''}`}></i>
                        </button>
                        <button onClick={() => handleDelete(stock.id)} className="text-red-600 hover:text-red-900">
                            <i className="fas fa-trash"></i>
                        </button>
                    </td>
                    </tr>
                  );
              })}
               {stocks.length === 0 && !loading && (
                  <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No stocks in portfolio.</td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Stock Position">
          <form onSubmit={handleAddStock} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Stock Symbol (e.g. 2330.TW, AAPL)</label>
                <input type="text" required value={symbol} onChange={e => setSymbol(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm uppercase"/>
                <p className="text-xs text-gray-500 mt-1">We will try to fetch the current price automatically.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Shares Owned</label>
                    <input type="number" required value={shares} onChange={e => setShares(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Avg Cost per Share</label>
                    <input type="number" required value={avgCost} onChange={e => setAvgCost(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                  </div>
              </div>
              <div className="mt-5 sm:mt-6">
                <Button type="submit" className="w-full" isLoading={submitting}>Add to Portfolio</Button>
              </div>
          </form>
      </Modal>
    </div>
  );
};

export default Stocks;