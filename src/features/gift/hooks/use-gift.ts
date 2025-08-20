import { useEffect, useState } from 'react';

import { createGift, deleteGift, getGifts, updateGift } from '~/features/gift/service/gift-service';
import type { Gift } from '~/features/gift/types/gift';

export function useGift() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = async () => {
    try {
      const response = await getGifts();
      setGifts(response.data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleCreate = async (params: { name: string; alias: string; requiredTicket: number; image: File }) => {
    try {
      const response = await createGift(params);

      setGifts((prev) => {
        const newGift = response.data;
        return [...prev, newGift];
      });
      setError(null);
      return response.data;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const handleUpdate = async (
    giftId: string,
    params: {
      name?: string;
      alias?: string;
      requiredTicket?: number;
      image?: File;
    }
  ) => {
    try {
      const response = await updateGift(giftId, params);

      await fetchAll();

      setError(null);
      return response.data;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const handleDelete = async (giftId: string) => {
    try {
      await deleteGift(giftId);
      setGifts((prev) => prev.filter((gift) => gift.id !== giftId));
      setError(null);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    gifts,
    error,
    refetch: fetchAll,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
}
