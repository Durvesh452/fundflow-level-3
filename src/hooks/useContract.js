import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchCampaignInfo } from '../utils/stellar';
import { CONFIG } from '../config';

const MAX_ACTIVITY_ITEMS = 10;

export const useContract = () => {
  const [campaignData, setCampaignData] = useState(null);
  const [activity, setActivity] = useState([]); // [{address, amount, time}]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const lastDonorRef = useRef(null);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchCampaignInfo();
      setCampaignData(data);
      setError(null);

      // If there's a new donation, add it to the activity feed
      if (
        data.last_donor_address &&
        data.last_donor_address !== lastDonorRef.current &&
        data.last_donation_amount > 0n
      ) {
        lastDonorRef.current = data.last_donor_address;
        setActivity((prev) => {
          const newItem = {
            id: Date.now(),
            address: data.last_donor_address,
            amount: data.last_donation_amount,
            time: new Date(),
          };
          return [newItem, ...prev].slice(0, MAX_ACTIVITY_ITEMS);
        });
      }
    } catch (err) {
      setError(err.message);
      console.error('Poll error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // On mount + polling
  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, CONFIG.POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [refresh]);

  return { campaignData, activity, loading, error, refresh };
};
