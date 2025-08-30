import * as XLSX from 'xlsx';

export interface ExcelRow {
  [key: string]: unknown;
}

/**
 * 엑셀 파일을 읽어서 JSON 데이터로 변환
 */
export const readExcelFile = (file: File): Promise<ExcelRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // 첫 번째 시트 가져오기
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // JSON으로 변환 (첫 번째 행을 헤더로 사용)
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: '',
        });

        if (jsonData.length === 0) {
          resolve([]);
          return;
        }

        // 첫 번째 행을 키로 사용하여 객체 배열 생성
        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1) as unknown[][];

        const result = rows.map((row) => {
          const obj: ExcelRow = {};
          headers.forEach((header, index) => {
            obj[header] = row[index] || '';
          });
          return obj;
        });

        resolve(result);
      } catch (error) {
        reject(error instanceof Error ? error : new Error('알 수 없는 오류가 발생했습니다.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('파일을 읽는데 실패했습니다.'));
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * 엑셀 파일 유효성 검사
 */
export const validateExcelFile = (file: File): string | null => {
  const allowedTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  const allowedExtensions = ['.xls', '.xlsx'];

  const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));

  if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
    return '엑셀 파일(.xls, .xlsx)만 업로드할 수 있습니다.';
  }

  // 10MB 제한
  if (file.size > 10 * 1024 * 1024) {
    return '파일 크기는 10MB를 초과할 수 없습니다.';
  }

  return null;
};

/**
 * 엑셀 템플릿 다운로드용 데이터 생성
 */
export const createExcelTemplate = (headers: string[], filename: string) => {
  const worksheet = XLSX.utils.aoa_to_sheet([headers]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  // 파일 다운로드
  XLSX.writeFile(workbook, filename);
};

/**
 * 기존 데이터가 포함된 엑셀 템플릿 생성
 */
export const createExcelTemplateWithData = (headers: string[], data: ExcelRow[], filename: string) => {
  // 헤더 + 데이터 행들을 배열로 구성
  const sheetData = [
    headers, // 헤더 행
    ...data.map((row) => headers.map((header) => row[header] || '')), // 각 헤더에 맞는 데이터 추출
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  // 파일 다운로드
  XLSX.writeFile(workbook, filename);
};
