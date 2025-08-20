import type { Gift } from '~/features/gift/types/gift';
import api from '~/shared/lib/api';

export const getGifts = async () => {
  return await api.get<Gift[]>('/gift');
};

export const createGift = async (params: { name: string; alias: string; requiredTicket: number; image: File }) => {
  const { name, alias, requiredTicket, image } = params;

  const formData = new FormData();
  formData.append('name', name);
  formData.append('alias', alias);
  formData.append('requiredTicket', requiredTicket.toString());
  formData.append('image', image);

  return await api.post<Gift>('/admin/gift', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const updateGift = async (
  giftId: string,
  params: {
    name?: string;
    alias?: string;
    requiredTicket?: number;
    image?: File;
  }
) => {
  const { name, alias, requiredTicket, image } = params;

  const formData = new FormData();
  if (name !== undefined && name.trim() !== '') {
    formData.append('name', name);
  }
  if (alias !== undefined && alias.trim() !== '') {
    formData.append('alias', alias);
  }
  if (requiredTicket !== undefined) {
    formData.append('requiredTicket', requiredTicket.toString());
  }
  if (image !== undefined) {
    formData.append('image', image);
  }

  return await api.patch<Gift>(`/admin/gift/${giftId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteGift = async (giftId: string) => {
  return await api.delete(`/admin/gift/${giftId}`);
};
