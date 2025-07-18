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
  birth: string;
  height: number;
  weight: number;
  position: string;
  backNumber: number;
  image: File;
}) => {
  const { name, university, sport, department, birth, height, weight, position, backNumber, image } = params;

  const formData = new FormData();
  formData.append('name', name);
  formData.append('university', university);
  formData.append('sport', sport);
  formData.append('department', department);
  formData.append('birth', birth);
  formData.append('height', height.toString());
  formData.append('weight', weight.toString());
  formData.append('position', position);
  formData.append('backNumber', backNumber.toString());
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
    name?: string;
    university?: University;
    sport?: Sport;
    department?: string;
    birth?: string;
    height?: number;
    weight?: number;
    position?: string;
    backNumber?: number;
    image?: File;
  }
) => {
  const { name, university, sport, department, birth, height, weight, position, backNumber, image } = parmas;

  const formData = new FormData();
  if (name !== undefined && name.trim() !== '') {
    formData.append('name', name);
  }
  if (university !== undefined) {
    formData.append('university', university);
  }
  if (sport !== undefined) {
    formData.append('sport', sport);
  }
  if (department !== undefined && department.trim() !== '') {
    formData.append('department', department);
  }
  if (birth !== undefined && birth.trim() !== '') {
    formData.append('birth', birth);
  }
  if (height !== undefined) {
    formData.append('height', height.toString());
  }
  if (weight !== undefined) {
    formData.append('weight', weight.toString());
  }
  if (position !== undefined && position.trim() !== '') {
    formData.append('position', position);
  }
  if (backNumber !== undefined) {
    formData.append('backNumber', backNumber.toString());
  }
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
