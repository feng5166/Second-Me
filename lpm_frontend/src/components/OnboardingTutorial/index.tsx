'use client';

import Image from 'next/image';

interface OnboardingTutorialProps {
  onComplete: () => void;
  onClose: () => void;
}

export default function OnboardingTutorial({ onComplete, onClose }: OnboardingTutorialProps) {
  const steps = [
    {
      title: '定义你的身份',
      description: '首先定义你的身份 - 这是你的分身的基础。',
      image: '/images/step_1.png'
    },
    {
      title: '上传你的记忆',
      description: '通过上传笔记、文档或其他内容来分享你的经历。',
      image: '/images/step_2.png'
    },
    {
      title: '训练你的分身',
      description: '训练你的 AI 模型，学习你的身份、经历和偏好。',
      image: '/images/step_3.png'
    },
    {
      title: '加入 AI 网络',
      description: '探索你的分身与网络中其他 AI 实体之间的交互。',
      image: '/images/step_4.png'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div className="bg-secondme-warm-bg rounded-2xl p-10 max-w-6xl w-full shadow-2xl border-2 border-gray-800/10 relative overflow-hidden">
        {/* Background gradient decorations */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-orange-50 opacity-70" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-orange-50 opacity-70" />

        <button
          aria-label="Close"
          className="absolute top-5 right-5 text-gray-500 hover:text-gray-700 transition-colors z-10"
          onClick={onClose}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M6 18L18 6M6 6l12 12"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        </button>

        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-3 text-gray-900">如何创建你的分身</h1>
          <p className="text-lg text-gray-600 max-w-3xl mb-8">
            按照这些简单的步骤来构建你的数字身份基础。
          </p>

          <div className="grid grid-cols-4 gap-6 mb-10">
            {steps.map((step, index) => (
              <div
                key={index}
                className="rounded-2xl overflow-hidden border-2 border-gray-800/10 hover:border-gray-800/20 
                         transition-all bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] 
                         hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 flex flex-col"
              >
                <div className="relative w-full pt-[75%] group">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 group-hover:to-black/10 transition-all" />
                  <div className="absolute inset-0">
                    <Image
                      alt={step.title}
                      className="transition-transform group-hover:scale-105 object-cover w-full h-full"
                      height={100}
                      priority
                      src={step.image}
                      width={100}
                    />
                  </div>
                  <div className="absolute top-3 left-3 flex items-center justify-center w-7 h-7 rounded-full bg-gray-900 text-white text-xs font-bold">
                    {index + 1}
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-b from-white to-gray-50 flex-grow">
                  <h3 className="text-base font-semibold mb-1.5 text-gray-800">{step.title}</h3>
                  <p className="text-sm text-gray-600/90 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end items-center pt-4 border-t border-gray-800/10">
            <button
              className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium flex items-center gap-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)]"
              onClick={onComplete}
            >
              继续
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M9 5l7 7-7 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
