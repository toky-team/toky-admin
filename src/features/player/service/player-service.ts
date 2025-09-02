import type { Player } from '~/features/player/types/player';
import api from '~/shared/lib/api';
import type { Sport } from '~/shared/types/sport';
import type { University } from '~/shared/types/university';

export const getPlayers = async (sport?: Sport, university?: University) => {
  const params: Record<string, string> = {};
  if (sport) params.sport = sport;
  if (university) params.university = university;

  return await api.get<Player[]>('/player', {
    params,
  });
};

export const createPlayer = async (params: {
  name: string;
  university: University;
  sport: Sport;
  department: string;
  birth: string | null;
  height: number | null;
  weight: number | null;
  position: string;
  backNumber: number;
  careers: string[];
  isPrimary: boolean;
  image: File;
}) => {
  const {
    name,
    university,
    sport,
    department,
    birth,
    height,
    weight,
    position,
    backNumber,
    careers,
    isPrimary,
    image,
  } = params;

  const formData = new FormData();
  formData.append('name', name);
  formData.append('university', university);
  formData.append('sport', sport);
  formData.append('department', department);
  formData.append('birth', birth ?? '');
  formData.append('height', height?.toString() ?? '');
  formData.append('weight', weight?.toString() ?? '');
  formData.append('position', position);
  formData.append('backNumber', backNumber.toString());
  formData.append('careers', JSON.stringify(careers));
  formData.append('isPrimary', isPrimary ? isPrimary.toString() : '');
  formData.append('image', image);

  return await api.post<Player>('/admin/player', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const updatePlayer = async (
  playerId: string,
  parmas: {
    name: string;
    university: University;
    sport: Sport;
    department: string;
    birth: string | null;
    height: number | null;
    weight: number | null;
    position: string;
    backNumber: number;
    careers: string[];
    isPrimary: boolean;
    image?: File;
  }
) => {
  const {
    name,
    university,
    sport,
    department,
    birth,
    height,
    weight,
    position,
    backNumber,
    careers,
    isPrimary,
    image,
  } = parmas;

  const formData = new FormData();
  formData.append('name', name);
  formData.append('university', university);
  formData.append('sport', sport);
  formData.append('department', department);
  formData.append('birth', birth ?? '');
  formData.append('height', height?.toString() ?? '');
  formData.append('weight', weight?.toString() ?? '');
  formData.append('position', position);
  formData.append('backNumber', backNumber.toString());
  formData.append('careers', JSON.stringify(careers));
  formData.append('isPrimary', isPrimary ? isPrimary.toString() : '');
  if (image) {
    formData.append('image', image);
  }

  return await api.patch<Player>(`/admin/player/${playerId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deletePlayer = async (playerId: string) => {
  return await api.delete(`/admin/player/${playerId}`);
};
