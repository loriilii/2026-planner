"use client"
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, Circle, Plus, TrendingUp, Calendar, Target } from 'lucide-react';

export default function PlannerApp() {
  const [activeTab, setActiveTab] = useState('finance');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [goals, setGoals] = useState([]);
  const [financeItems, setFinanceItems] = useState([]);
  const [savings, setSavings] = useState([]);

  // --- 資料抓取邏輯 ---
  useEffect(() => {
    fetchData();
  }, [month, activeTab]);

  const fetchData = async () => {
    const { data: goalsData } = await supabase.from('yearly_goals').select('*');
    const { data: financeData } = await supabase.from('monthly_finance').select('*').eq('month', month);
    const { data: savingsData } = await supabase.from('savings_plan').select('*');
    
    if (goalsData) setGoals(goalsData);
    if (financeData) setFinanceItems(financeData);
    if (savingsData) setSavings(savingsData);
  };

  // --- 功能操作 ---
  const toggleCheck = async (table, id, currentStatus) => {
    await supabase.from(table).update({ is_checked: !currentStatus }).eq('id', id);
    fetchData();
  };

  const addItem = async () => {
    const title = prompt("請輸入項目名稱 (例如：電費 或 第一週支出)");
    const budget = parseInt(prompt("請輸入預算金額") || "0");
    if (!title) return;

    await supabase.from('monthly_finance').insert([
      { month, title, budget, actual: 0, is_checked: false }
    ]);
    fetchData();
  };

  // --- 計算總額 ---
  const totalBudget = financeItems.reduce((sum, item) => sum + (item.budget || 0), 0);
  const totalActual = financeItems.reduce((sum, item) => sum + (item.actual || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
        
        {/* 標題與選單 */}
        <div className="bg-indigo-600 p-6 text-white text-center">
          <h1 className="text-2xl font-bold">2025 年度數位規劃表</h1>
          <div className="flex justify-center gap-6 mt-6">
            <button onClick={() => setActiveTab('goals')} className={`flex items-center gap-2 ${activeTab === 'goals' ? 'underline decoration-2 underline-offset-8' : 'opacity-70'}`}><Target size={18}/> 年度目標</button>
            <button onClick={() => setActiveTab('finance')} className={`flex items-center gap-2 ${activeTab === 'finance' ? 'underline decoration-2 underline-offset-8' : 'opacity-70'}`}><Calendar size={18}/> 財務規劃</button>
            <button onClick={() => setActiveTab('savings')} className={`flex items-center gap-2 ${activeTab === 'savings' ? 'underline decoration-2 underline-offset-8' : 'opacity-70'}`}><TrendingUp size={18}/> 存錢計畫</button>
          </div>
        </div>

        <div className="p-6">
          {/* 1. 年度目標分頁 */}
          {activeTab === 'goals' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold border-l-4 border-indigo-500 pl-3">年度目標總覽</h2>
              {goals.map(goal => (
                <div key={goal.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50">
                  <span>{goal.goal_name}</span>
                  <button onClick={() => toggleCheck('yearly_goals', goal.id, goal.is_completed)}>
                    {goal.is_completed ? <CheckCircle2 className="text-green-500" /> : <Circle className="text-gray-300" />}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 2. 每月財務分頁 */}
          {activeTab === 'finance' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="text-xl font-bold bg-gray-100 p-2 rounded-lg">
                  {Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1}>{i+1} 月規劃</option>)}
                </select>
                <button onClick={addItem} className="bg-indigo-500 text-white px-4 py-2 rounded-full flex items-center gap-1 hover:bg-indigo-600 transition">
                  <Plus size={18}/> 新增項目
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-3 font-medium">勾稽</th>
                      <th className="pb-3 font-medium">項目 (含週次)</th>
                      <th className="pb-3 font-medium">預算</th>
                      <th className="pb-3 font-medium">實際花費</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financeItems.map(item => (
                      <tr key={item.id} className="border-b last:border-0">
                        <td className="py-4">
                          <button onClick={() => toggleCheck('monthly_finance', item.id, item.is_checked)}>
                            {item.is_checked ? <CheckCircle2 className="text-indigo-500" /> : <Circle className="text-gray-300" />}
                          </button>
                        </td>
                        <td className="py-4 font-medium">{item.title}</td>
                        <td className="py-4 text-gray-600">${item.budget}</td>
                        <td className="py-4"><input type="number" defaultValue={item.actual} className="w-20 border rounded px-2" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 自動加總區 */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-2xl">
                  <p className="text-sm text-blue-600">本月預算總計</p>
                  <p className="text-2xl font-bold">${totalBudget}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-2xl">
                  <p className="text-sm text-green-600">實際支出總計</p>
                  <p className="text-2xl font-bold">${totalActual}</p>
                </div>
              </div>
            </div>
          )}

          {/* 3. 存錢計畫分頁 */}
          {activeTab === 'savings' && (
            <div className="space-y-8">
              <h2 className="text-xl font-bold border-l-4 border-indigo-500 pl-3">存錢計畫進度</h2>
              {savings.map(plan => (
                <div key={plan.id} className="space-y-2">
                  <div className="flex justify-between font-medium">
                    <span>{plan.target_name}</span>
                    <span>${plan.current_amount} / ${plan.target_amount}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-indigo-500 h-4 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min((plan.current_amount / plan.target_amount) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <p className="text-center text-gray-400 text-sm mt-8">資料同步至雲端資料庫 Supabase</p>
    </div>
  );
}
