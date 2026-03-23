'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import InfoModal from '@/components/InfoModal';
import MemoryList from '@/components/train/MemoryList';
import UploadMemories from '@/components/train/UploadMemories';
import { message } from 'antd';
import { deleteMemory, getMemoryList } from '@/service/memory';
import { useTrainingStore } from '@/store/useTrainingStore';
import { fileTransformToMemory } from '@/utils/memory';
import { ROUTER_PATH } from '@/utils/router';
import { EVENT } from '@/utils/event';

interface TrainSectionInfo {
  name: string;
  description: string;
  features: string[];
}

const trainSectionInfo: Record<string, TrainSectionInfo> = {
  upload: {
    name: '上传记忆',
    description:
      '与你的分身分享你的经历，让它学会像你一样思考和回应。' +
      '你上传的每一段记忆都会成为 AI 的生活经验，帮助它理解你的观点、价值观和沟通风格。' +
      '你提供的个人背景越多，你的数字分身就越真实。',
    features: [
      '拖拽上传文件',
      '批量文件夹上传',
      '直接输入文本内容',
      '文件大小和类型验证',
      '上传进度跟踪'
    ]
  },
  'memory-list': {
    name: '记忆列表',
    description: '查看和管理你上传的所有训练材料。在开始训练之前，整理和审查你的记忆。',
    features: [
      '所有记忆的列表视图',
      '记忆类型识别',
      '大小和上传时间显示',
      '记忆内容预览',
      '删除和管理记忆'
    ]
  }
};

export interface Memory {
  id: string;
  type: 'text' | 'file' | 'folder';
  name: string;
  content?: string;
  size: string;
  uploadedAt: string;
  isTrained?: boolean;
}

export default function TrainPage() {
  // Title and explanation section
  const pageTitle = '上传记忆';
  const pageDescription =
    '上传能帮助 AI 更好理解你的内容。这些不仅仅是文件——它们是你的分身要经历的体验和想法。通过处理这些记忆，你的 AI 学会像你一样看待世界，采用你独特的视角和决策模式。';

  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedInfo, setSelectedInfo] = useState<string | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);

  const setStatus = useTrainingStore((state) => state.setStatus);

  useEffect(() => {
    const fetchMemories = async () => {
      getMemoryList()
        .then((res) => {
          if (res.data.code !== 0) {
            throw new Error(res.data.message);
          } else {
            const fileList = res.data.data;
            const newMemories = fileList.map((file) => fileTransformToMemory(file));

            setMemories(newMemories);
            // Only update status when there are no training steps
            const trainingProgress = useTrainingStore.getState().trainingProgress;

            if (trainingProgress.overall_progress === 0) {
              setStatus(newMemories.length > 0 ? 'memory_upload' : 'seed_identity');
            }
          }
        })
        .catch((error: Error) => {
          message.error(error.message);
        });
    };

    fetchMemories();
    addEventListener(EVENT.REFRESH_MEMORIES, fetchMemories);

    return () => {
      removeEventListener(EVENT.REFRESH_MEMORIES, fetchMemories);
    };
  }, []);

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const handleFileUpload = (files: any[]) => {
    const newMemories: Memory[] = Array.from(files).map((file) => ({
      id: Math.random().toString(),
      type: 'file',
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      uploadedAt: new Date().toLocaleString(),
      isTrained: false
    }));

    setMemories((prev) => {
      const updatedMemories = [...newMemories, ...prev];
      const trainingProgress = useTrainingStore.getState().trainingProgress;

      if (trainingProgress.overall_progress === 0) {
        setStatus(newMemories.length > 0 ? 'memory_upload' : 'seed_identity');
      }

      setTimeout(scrollToBottom, 100);

      return updatedMemories;
    });
  };

  const handleDeleteMemory = async (id: string, name: string) => {
    const res = await deleteMemory(name);

    if (res.data.code === 0) {
      setMemories((prev) => {
        const updatedMemories = prev.filter((memory) => memory.id !== id);
        const trainingProgress = useTrainingStore.getState().trainingProgress;

        if (trainingProgress.overall_progress === 0) {
          setStatus(updatedMemories.length > 0 ? 'memory_upload' : 'seed_identity');
        }

        return updatedMemories;
      });
      message.success(`记忆 "${name}" 删除成功！`);
    } else {
      message.error(res.data.message);
    }
  };

  const renderInfoButton = (section: string) => (
    <button
      className="ml-auto p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
      onClick={() => setSelectedInfo(section)}
      title={`了解更多关于${trainSectionInfo[section].name}`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    </button>
  );

  return (
    <>
      <div
        ref={containerRef}
        className="max-w-6xl mx-auto px-6 py-8 space-y-8 overflow-y-auto h-full"
      >
        {/* Page Title and Description */}
        <div className="mb-4">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">{pageTitle}</h1>
          <p className="text-gray-600 max-w-6xl">{pageDescription}</p>
        </div>
        {/* Upload Memories Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-0">上传记忆</h2>
            {renderInfoButton('upload')}
          </div>
          <UploadMemories onFileUpload={handleFileUpload} />
        </div>

        {/* Memory List Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold tracking-tight text-gray-900">记忆列表</h2>
            {renderInfoButton('memory-list')}
          </div>
          <MemoryList memories={memories} onDelete={handleDeleteMemory} />
        </div>

        {/* Next Button */}
        <div className="flex justify-end mt-4">
          <button
            className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center gap-2"
            onClick={() => router.push(ROUTER_PATH.TRAIN_TRAINING)}
          >
            下一步：训练
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
          </button>
        </div>
      </div>

      <InfoModal
        content={
          selectedInfo ? (
            <div className="space-y-4">
              <p className="text-gray-600">{trainSectionInfo[selectedInfo].description}</p>
              <div>
                <h4 className="font-medium mb-2">主要功能：</h4>
                <ul className="list-disc pl-5 space-y-1.5">
                  {trainSectionInfo[selectedInfo].features.map((feature, index) => (
                    <li key={index} className="text-gray-600">
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null
        }
        onClose={() => setSelectedInfo(null)}
        open={!!selectedInfo && !!trainSectionInfo[selectedInfo]}
        title={selectedInfo ? trainSectionInfo[selectedInfo].name : ''}
      />
    </>
  );
}
