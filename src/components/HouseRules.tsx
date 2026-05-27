import { DocumentTextIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface HouseRule {
  id: number;
  rule_text: string;
  order_num: number;
  is_active: boolean;
}

const HouseRules: React.FC = () => {
  const [houseRules, setHouseRules] = useState<HouseRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHouseRules();
  }, []);

  const fetchHouseRules = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('house_rules')
        .select('id, rule_text, order_num, is_active')
        .eq('is_active', true)
        .order('order_num', { ascending: true });

      if (error) {
        return;
      }

      setHouseRules(data || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-3 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (houseRules.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <DocumentTextIcon className="h-6 w-6 text-blue-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">House Rules</h2>
      </div>
      
      <div className="space-y-3">
        {houseRules.map((rule, index) => (
          <div key={rule.id} className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-xs font-medium text-blue-800">{index + 1}</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {rule.rule_text}
            </p>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Please ensure you follow all house rules during your stay. For any questions, please contact our staff.
        </p>
      </div>
    </div>
  );
};

export default HouseRules;
