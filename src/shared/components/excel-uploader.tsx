import { Upload } from 'lucide-react';
import { useRef, useState } from 'react';

import type { ExcelRow } from '~/shared/lib/excel-utils';
import { readExcelFile, validateExcelFile } from '~/shared/lib/excel-utils';
import { Button } from '~/shared/ui/button';

interface ExcelUploaderProps {
  onDataParsed: (data: ExcelRow[]) => void;
  onError: (error: string) => void;
  acceptedColumns?: string[];
  className?: string;
  children?: React.ReactNode;
}

export function ExcelUploader({
  onDataParsed,
  onError,
  acceptedColumns = [],
  className = '',
  children,
}: ExcelUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 유효성 검사
    const validationError = validateExcelFile(file);
    if (validationError) {
      onError(validationError);
      return;
    }

    setIsLoading(true);

    readExcelFile(file)
      .then((data) => {
        // 빈 데이터 체크
        if (data.length === 0) {
          onError('엑셀 파일에 데이터가 없습니다.');
          return;
        }

        // 필수 컬럼 체크 (acceptedColumns가 있을 경우)
        if (acceptedColumns.length > 0) {
          const fileColumns = Object.keys(data[0]);
          const missingColumns = acceptedColumns.filter((col) => !fileColumns.includes(col));

          if (missingColumns.length > 0) {
            onError(`다음 컬럼이 누락되었습니다: ${missingColumns.join(', ')}`);
            return;
          }
        }

        onDataParsed(data);
      })
      .catch((error) => {
        onError(error instanceof Error ? error.message : '파일을 처리하는 중 오류가 발생했습니다.');
      })
      .finally(() => {
        setIsLoading(false);
        // 파일 입력 초기화
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      });
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {children ? (
        <div onClick={handleFileSelect} className="cursor-pointer">
          {children}
        </div>
      ) : (
        <Button
          type="button"
          onClick={handleFileSelect}
          disabled={isLoading}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          {isLoading ? '파일 처리 중...' : '엑셀 파일 선택'}
        </Button>
      )}
    </div>
  );
}
