'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { ILoadInfo } from '@/service/info';
import { updateLoadInfo } from '@/service/info';
import { useLoadInfoStore } from '@/store/useLoadInfoStore';
import { ROUTER_PATH } from '@/utils/router';
import { message } from 'antd';

export default function IdentityPage() {
  const pageTitle = '定义你的身份';
  const pageDescription = '用你的基本信息构建 AI 的基础。';

  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [originalDescription, setOriginalDescription] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');
  const [isEdited, setIsEdited] = useState(false);
  const [emailError, setEmailError] = useState('');
  const loadInfo = useLoadInfoStore((state) => state.loadInfo);
  const fetchLoadInfo = useLoadInfoStore((state) => state.fetchLoadInfo);

  const setInfo = (localInfo: ILoadInfo) => {
    const { name: _name, description: _description, email: _email } = localInfo;

    setName(_name);
    setDescription(_description);
    setEmail(_email || '');
    setOriginalName(_name);
    setOriginalDescription(_description);
    setOriginalEmail(_email || '');
  };

  useEffect(() => {
    const localUploadInfoStr = localStorage.getItem('upload');

    if (localUploadInfoStr) {
      try {
        const localUploadInfo = JSON.parse(localUploadInfoStr);

        setInfo(localUploadInfo);
      } catch {
        console.error('Failed to parse local upload info');
      }
    }

    fetchLoadInfo();
  }, []);

  useEffect(() => {
    if (loadInfo) {
      setInfo(loadInfo);
    }
  }, [loadInfo]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    checkIfEdited(e.target.value, description, email);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    checkIfEdited(name, e.target.value, email);
  };

  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError('邮箱不能为空');

      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(value)) {
      setEmailError('请输入有效的邮箱地址');

      return false;
    }

    setEmailError('');

    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setEmail(value);
    validateEmail(value);
    checkIfEdited(name, description, value);
  };

  const checkIfEdited = (newName: string, newDescription: string, newEmail: string) => {
    setIsEdited(
      newName !== originalName ||
        newDescription !== originalDescription ||
        newEmail !== originalEmail
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      message.error('名称不能为空');

      return;
    }

    if (name.includes(' ')) {
      message.error('名称不能包含空格');

      return;
    }

    if (!validateEmail(email)) {
      return;
    }

    if (loadInfo) {
      // Update user information
      try {
        const res = await updateLoadInfo({ name, description, email });

        if (res.data.code === 0) {
          message.success('身份更新成功');
          // Update local storage

          const updatedData = { ...loadInfo, name, description, email };

          localStorage.setItem('upload', JSON.stringify(updatedData));

          useLoadInfoStore.getState().fetchLoadInfo();
        } else {
          message.error(res.data.message);
        }
      } catch (error) {
        console.error('Failed to update identity:', error);
        message.error('更新身份失败');
      } finally {
        setIsEdited(false);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8 overflow-y-auto h-full">
      {/* Page Title and Description */}
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">{pageTitle}</h1>
        <p className="text-gray-600 max-w-3xl">{pageDescription}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="space-y-4">
          <div className="space-y-3">
            {/* Name section */}
            <div>
              <label className="block text-[14px] font-medium text-gray-700 mb-0.5">分身名称</label>
              <p className="text-sm text-gray-500 mb-1 leading-relaxed">
                这个名字将代表你和你的分身。
              </p>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:border-gray-400 focus:ring-2 focus:ring-gray-400/20 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,0.03)]"
                maxLength={20}
                onChange={handleNameChange}
                placeholder="例如：Felix（不允许空格）"
                type="text"
                value={name}
              />
              <p className="mt-0.5 text-xs text-gray-500">{name.length}/20 个字符</p>
            </div>

            <div>
              <label className="block text-[14px] font-medium text-gray-700 mb-0.5">个人简介</label>
              <p className="text-sm text-gray-500 mb-1 leading-relaxed">
                简要描述你自己：性格、动机或风格。
              </p>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:border-gray-400 focus:ring-2 focus:ring-gray-400/20 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,0.03)] resize-none leading-relaxed"
                maxLength={200}
                onChange={handleDescriptionChange}
                placeholder="例如：'喜欢冒险、数据驱动，喜欢学习新技术。'"
                rows={3}
                value={description}
              />
              <p className="mt-0.5 text-xs text-gray-500">{description.length}/200 个字符</p>
            </div>

            <div>
              <label className="block text-[14px] font-medium text-gray-700 mb-0.5">分身邮箱</label>
              <p className="text-sm text-gray-500 mb-1 leading-relaxed">
                此邮箱将用作你的分身的联系方式。你可以使用自己的邮箱地址。
              </p>
              <input
                className={`w-full px-4 py-2 border ${emailError ? 'border-red-500' : 'border-gray-300'} rounded-lg bg-white text-gray-700 focus:border-gray-400 focus:ring-2 focus:ring-gray-400/20 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,0.03)]`}
                onChange={handleEmailChange}
                placeholder="例如：your.name@example.com"
                type="email"
                value={email}
              />
              {emailError && <p className="mt-1 text-xs text-red-500">{emailError}</p>}
            </div>

            <div className="flex justify-end pt-2">
              <button
                className={`px-6 py-2 rounded-lg text-white font-medium transition-all ${
                  isEdited
                    ? 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
                disabled={!isEdited}
                onClick={() => {
                  handleSave();
                }}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Next button outside the form */}
      <div className="mt-6 flex justify-end">
        <button
          className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center gap-2"
          onClick={() => router.push(ROUTER_PATH.TRAIN_MEMORIES)}
        >
          下一步：上传记忆
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
        </button>
      </div>
    </div>
  );
}
