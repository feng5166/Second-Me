'use client';

import type React from 'react';
import { Fragment, useMemo, useState } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { PlayIcon, StopIcon } from '@heroicons/react/24/outline';
import { EVENT } from '../../utils/event';
import { Checkbox, InputNumber, message, Radio, Spin, Tooltip } from 'antd';
import type { TrainingConfig } from '@/service/train';
import { QuestionCircleOutlined } from '@ant-design/icons';
import OpenAiModelIcon from '../svgs/OpenAiModelIcon';
import CustomModelIcon from '../svgs/CustomModelIcon';
import ColumnArrowIcon from '../svgs/ColumnArrowIcon';
import DoneIcon from '../svgs/DoneIcon';
import ThinkingModelModal from '../ThinkingModelModal';
import { useModelConfigStore } from '@/store/useModelConfigStore';
import classNames from 'classnames';

interface BaseModelOption {
  value: string;
  label: string;
}

interface ModelConfig {
  provider_type?: string;
  [key: string]: any;
}

interface TrainingConfigurationProps {
  baseModelOptions: BaseModelOption[];
  modelConfig: ModelConfig | null;
  isTraining: boolean;
  updateTrainingParams: (params: TrainingConfig) => void;
  status: string;
  trainSuspended: boolean;
  handleResetProgress: () => void;
  handleTrainingAction: () => Promise<void>;
  trainActionLoading: boolean;
  setSelectedInfo: React.Dispatch<React.SetStateAction<boolean>>;
  trainingParams: TrainingConfig;
  cudaAvailable: boolean;
}

const synthesisModeOptions = [
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' }
];

const TrainingConfiguration: React.FC<TrainingConfigurationProps> = ({
  baseModelOptions,
  modelConfig,
  isTraining,
  updateTrainingParams,
  trainingParams,
  status,
  handleResetProgress,
  trainSuspended,
  trainActionLoading,
  handleTrainingAction,
  setSelectedInfo,
  cudaAvailable
}) => {
  const [openThinkingModel, setOpenThinkingModel] = useState<boolean>(false);
  const [showThinkingWarning, setShowThinkingWarning] = useState<boolean>(false);
  const thinkingModelConfig = useModelConfigStore((state) => state.thinkingModelConfig);

  const disabledChangeParams = useMemo(() => {
    return isTraining || trainSuspended;
  }, [isTraining, trainSuspended]);

  const thinkingConfigComplete = useMemo(() => {
    return (
      !!thinkingModelConfig.thinking_model_name &&
      !!thinkingModelConfig.thinking_api_key &&
      !!thinkingModelConfig.thinking_endpoint
    );
  }, [thinkingModelConfig]);

  const trainButtonText = useMemo(() => {
    return isTraining
      ? '停止训练'
      : status === 'trained'
        ? '重新训练'
        : trainSuspended
          ? '继续训练'
          : '开始训练';
  }, [isTraining, status, trainSuspended]);

  const trainButtonIcon = useMemo(() => {
    return isTraining ? (
      trainActionLoading ? (
        <Spin className="h-5 w-5 mr-2" />
      ) : (
        <StopIcon className="h-5 w-5 mr-2" />
      )
    ) : (
      <PlayIcon className="h-5 w-5 mr-2" />
    );
  }, [isTraining, trainActionLoading]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold tracking-tight text-gray-900">训练配置</h2>
        <button
          className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
          onClick={() => setSelectedInfo(true)}
          title="了解更多关于训练流程"
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
      </div>
      <p className="text-gray-600 mb-6 leading-relaxed">
        {`配置如何使用你的记忆数据和身份来训练你的分身。然后点击"开始训练"。`}
      </p>

      <div className="space-y-6">
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-2">
            <h4 className="text-base font-semibold text-gray-800 flex items-center">
              第一步：选择数据合成支持模型
            </h4>
            {!modelConfig?.provider_type ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <label className="block text-sm font-medium text-red-500 mb-1">
                    未配置数据合成支持模型
                  </label>
                  <button
                    className="ml-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors cursor-pointer relative z-10"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.dispatchEvent(new CustomEvent(EVENT.SHOW_MODEL_CONFIG_MODAL));
                    }}
                  >
                    配置支持模型
                  </button>
                </div>
                <span className="text-xs text-gray-500">
                  Model used for processing and synthesizing your memory data
                </span>
              </div>
            ) : (
              <div className="flex items-center relative w-full rounded-lg bg-white py-2 text-left">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700">使用的模型：&nbsp;</span>
                  {modelConfig.provider_type === 'openai' ? (
                    <OpenAiModelIcon className="h-5 w-5 mr-2 text-green-600" />
                  ) : (
                    <CustomModelIcon className="h-5 w-5 mr-2 text-blue-600" />
                  )}
                  <span className="font-medium">
                    {modelConfig.provider_type === 'openai' ? 'OpenAI' : '自定义模型'}
                  </span>
                  <button
                    className={classNames(
                      'ml-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors cursor-pointer relative z-10',
                      disabledChangeParams && 'opacity-50 !cursor-not-allowed'
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      if (disabledChangeParams) {
                        message.warning('取消当前训练以配置模型');

                        return;
                      }

                      window.dispatchEvent(new CustomEvent(EVENT.SHOW_MODEL_CONFIG_MODAL));
                    }}
                  >
                    配置数据合成模型
                  </button>
                </div>
                <span className="ml-auto text-xs text-gray-500">
                  用于处理和合成你的记忆数据的模型
                </span>
              </div>
            )}
            <div className="flex flex-col gap-3">
              <div className="font-medium">数据合成模式</div>
              <Radio.Group
                disabled={disabledChangeParams}
                onChange={(e) =>
                  updateTrainingParams({
                    ...trainingParams,
                    data_synthesis_mode: e.target.value
                  })
                }
                optionType="button"
                options={synthesisModeOptions}
                value={trainingParams.data_synthesis_mode}
              />

              <span className="text-xs text-gray-500">
                低：快速数据合成。中：平衡合成质量和速度。高：丰富合成，速度较慢。
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-semibold text-gray-800 mb-1">
                第二步：选择训练分身的基础模型
              </h4>
              <span className="text-xs text-gray-500">
                用于训练分身的基础模型。根据你的可用系统资源选择。
              </span>
            </div>
            <Listbox
              disabled={disabledChangeParams}
              onChange={(value) => updateTrainingParams({ model_name: value })}
              value={trainingParams.model_name}
            >
              <div className="relative mt-1">
                <Listbox.Button
                  className={classNames(
                    'relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-300',
                    disabledChangeParams && 'opacity-50 !cursor-not-allowed'
                  )}
                >
                  <span className="block truncate">
                    {baseModelOptions.find((option) => option.value === trainingParams.model_name)
                      ?.label || '选择模型...'}
                  </span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ColumnArrowIcon className="h-5 w-5 text-gray-400" />
                  </span>
                </Listbox.Button>
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 z-[1] focus:outline-none">
                    {baseModelOptions.map((option) => (
                      <Listbox.Option
                        key={option.value}
                        className={({ active }) =>
                          `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'}`
                        }
                        value={option.value}
                      >
                        {({ selected }) => (
                          <>
                            <span
                              className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}
                            >
                              {option.label}
                            </span>
                            {selected ? (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                <DoneIcon className="h-5 w-5" />
                              </span>
                            ) : null}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <h4 className="text-base font-semibold text-gray-800 mb-1">
                第三步：配置高级训练参数
              </h4>
              <div className="text-xs text-gray-500">
                调整这些参数以控制训练质量和性能。推荐设置将确保训练稳定。
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <div className="flex gap-3 items-center">
                  <div className="font-medium">学习率</div>
                  <Tooltip title="较低的值提供稳定但较慢的学习，较高的值加速学习但有超调最优参数的风险，可能导致训练不稳定。">
                    <QuestionCircleOutlined className="cursor-pointer" />
                  </Tooltip>
                </div>
                <InputNumber
                  className="!w-[300px]"
                  disabled={disabledChangeParams}
                  max={0.005}
                  min={0.00003}
                  onChange={(value) => {
                    if (value == null) {
                      return;
                    }

                    updateTrainingParams({ ...trainingParams, learning_rate: value });
                  }}
                  status={
                    trainingParams.learning_rate == 0.005 || trainingParams.learning_rate == 0.00003
                      ? 'warning'
                      : undefined
                  }
                  step={0.0001}
                  value={trainingParams.learning_rate}
                />
                <div className="text-xs text-gray-500">
                  输入 0.00003 到 0.005 之间的值（推荐：0.0001）
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-3 items-center">
                  <div className="font-medium">训练轮数</div>
                  <Tooltip title="控制模型在训练期间对整个数据集进行多少次完整遍历。更多轮数可以更深入地识别模式和整合记忆，但会显著增加训练时间和所需的计算资源。">
                    <QuestionCircleOutlined className="cursor-pointer" />
                  </Tooltip>
                </div>
                <InputNumber
                  className="!w-[300px]"
                  disabled={disabledChangeParams}
                  max={10}
                  min={1}
                  onChange={(value) => {
                    if (value == null) {
                      return;
                    }

                    updateTrainingParams({ ...trainingParams, number_of_epochs: value });
                  }}
                  status={
                    trainingParams.number_of_epochs == 10 || trainingParams.number_of_epochs == 1
                      ? 'warning'
                      : undefined
                  }
                  step={1}
                  value={trainingParams.number_of_epochs}
                />
                <div className="text-xs text-gray-500">输入 1 到 10 之间的整数（推荐：2）</div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-3 items-center">
                  <div className="font-medium">并发线程数</div>
                  <Tooltip title="定义数据合成期间使用的并行处理流数量。较高的值可以减少总体训练时间，但会增加系统资源消耗，可能触发 API 速率限制，从而导致训练失败。">
                    <QuestionCircleOutlined className="cursor-pointer" />
                  </Tooltip>
                </div>
                <InputNumber
                  className="!w-[300px]"
                  disabled={disabledChangeParams}
                  max={10}
                  min={1}
                  onChange={(value) => {
                    if (value == null) {
                      return;
                    }

                    updateTrainingParams({ ...trainingParams, concurrency_threads: value });
                  }}
                  status={
                    trainingParams.concurrency_threads == 10 ||
                    trainingParams.concurrency_threads == 1
                      ? 'warning'
                      : undefined
                  }
                  step={1}
                  value={trainingParams.concurrency_threads}
                />
                <div className="text-xs text-gray-500">输入 1 到 10 之间的整数（推荐：2）</div>
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <div className="flex gap-3 items-center">
                  <div className="font-medium">启用 CUDA GPU 加速</div>
                  <Tooltip title="启用后，如果系统支持，训练将使用 CUDA GPU 加速。这可以显著加快训练速度，但需要兼容的 NVIDIA 硬件和驱动程序。">
                    <QuestionCircleOutlined className="cursor-pointer" />
                  </Tooltip>
                </div>
                <div className="flex items-center">
                  <label className="inline-flex items-center cursor-pointer relative">
                    <input
                      checked={trainingParams.use_cuda}
                      className="sr-only peer"
                      disabled={disabledChangeParams || !cudaAvailable}
                      onChange={(e) => {
                        updateTrainingParams({ ...trainingParams, use_cuda: e.target.checked });
                      }}
                      type="checkbox"
                    />
                    <div
                      className={`w-11 h-6 ${!cudaAvailable ? 'bg-gray-300' : 'bg-gray-200'} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${cudaAvailable ? 'peer-checked:bg-blue-600' : 'peer-checked:bg-gray-400'}`}
                    />
                    <span
                      className={`ms-3 text-sm font-medium ${!cudaAvailable ? 'text-gray-500' : 'text-gray-700'}`}
                    >
                      {trainingParams.use_cuda ? '已启用' : '已禁用'}
                    </span>
                  </label>
                </div>
                <div className="text-xs text-gray-500">
                  {cudaAvailable
                    ? '启用后可在 NVIDIA GPU 上加速训练。'
                    : '此系统不支持 CUDA 加速。'}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="text-base font-semibold text-gray-800 flex items-center">
              第四步：配置高级行为
            </div>

            <div className="flex mr-auto gap-2 items-center ">
              <Checkbox
                checked={trainingParams.is_cot}
                disabled={disabledChangeParams}
                onChange={(e) => {
                  e.stopPropagation();

                  if (!thinkingConfigComplete) {
                    setShowThinkingWarning(true);

                    if (!showThinkingWarning) {
                      setTimeout(() => setShowThinkingWarning(false), 2000);
                    }

                    return;
                  }

                  updateTrainingParams({ ...trainingParams, is_cot: e.target.checked });
                }}
              />
              <div
                className={classNames(
                  `text-sm font-medium px-4 py-2 bg-white border rounded-md cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]`,
                  showThinkingWarning
                    ? 'border-red-500 text-red-600 bg-red-50 shadow-[0_0_0_2px_rgba(220,38,38,0.4)] animate-pulse'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50',
                  disabledChangeParams && 'opacity-50 !cursor-not-allowed'
                )}
                onClick={() => {
                  if (disabledChangeParams) return;

                  setOpenThinkingModel(true);
                }}
              >
                思考模型
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end items-center gap-4 pt-4 border-t mt-4">
          {isTraining && (
            <div className="flex items-center text-amber-600 bg-amber-50 px-3 py-2 rounded-md border border-amber-200">
              <StopIcon className="h-5 w-5 mr-2" />
              <span className="font-medium">当前步骤完成后才能完全停止</span>
            </div>
          )}

          {trainButtonText === '继续训练' && (
            <button
              className={`inline-flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              onClick={() => handleResetProgress()}
            >
              <StopIcon className="h-5 w-5 mr-2" />
              重置训练
            </button>
          )}
          <button
            className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${isTraining ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}
            ${!isTraining && !modelConfig?.provider_type ? 'bg-gray-300 hover:bg-gray-400 cursor-not-allowed' : 'cursor-pointer'}
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            disabled={!isTraining && !modelConfig?.provider_type}
            onClick={handleTrainingAction}
          >
            {trainButtonIcon}
            {trainButtonText}
          </button>
        </div>
      </div>

      <ThinkingModelModal onClose={() => setOpenThinkingModel(false)} open={openThinkingModel} />
    </div>
  );
};

export default TrainingConfiguration;
