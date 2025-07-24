/**
 * multer를 활용한 파일 업로드 미들웨어입니다.
 *
 * 이 미들웨어는 업로드된 파일의 MIME 타입을 기준으로
 * 저장 디렉터리를 분기하여 자동으로 분류 저장하며,
 * 파일 이름은 고유 식별자를 포함한 형식으로 저장됩니다.
 *
 * 주요 기능:
 * - 이미지 파일: `storage/images/` 디렉터리에 저장
 * - 동영상 파일: `storage/videos/` 디렉터리에 저장
 * - 기타 문서: `storage/documents/` 디렉터리에 저장
 * - 디렉터리는 존재하지 않으면 자동 생성됨
 * - 파일명은 `timestamp-random-originalname` 형식으로 저장
 *
 * 주의사항:
 * - 저장 경로는 실행 위치를 기준으로 상대적으로 계산되며, 디렉터리 구조가 바뀌면 오류가 발생할 수 있습니다.
 * - 파일명이 겹치지 않도록 고유값이 자동 부여되지만, 파일 확장자는 원본 그대로 유지됩니다.
 */

import multer from 'multer';
import path from 'node:path';
import { makeDirectory } from '../utilities/Generater';

const parentsDirectory = path.join(__dirname, '../../');

/**
 * 파일 저장 전략을 정의하는 multer storage 객체입니다.
 *
 * @property destination MIME 타입에 따라 저장 경로를 동적으로 결정
 * @property filename 파일명을 고유값 기반으로 생성
 */
const storage = multer.diskStorage({
  destination: (request, file, callback) => {
    let directoryName: string = 'storage/';

    if (file.mimetype.startsWith('image/')) {
      directoryName += 'images';
    } else if (file.mimetype.startsWith('video/')) {
      directoryName += 'videos';
    } else {
      directoryName += 'documents';
    }

    const uploadDirectory = path.join(parentsDirectory, directoryName);

    makeDirectory(uploadDirectory);

    callback(null, uploadDirectory);
  },

  filename: (request, file, callback) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const savedFileName = `${uniqueSuffix}-${file.originalname}`;

    callback(null, savedFileName);
  },
});

/**
 * Express 라우터에서 사용할 수 있는 파일 업로드 미들웨어입니다.
 *
 * @example
 * app.post('/upload', fileUploadMiddleware.single('file'), (request, response) => { ... });
 */
export const fileUploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});
