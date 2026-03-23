'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createLoadInfo } from '@/service/info';
import OnboardingTutorial from '../../../../components/OnboardingTutorial';
import { ROUTER_PATH } from '@/utils/router';
import { message } from 'antd';

interface CreateSecondMeProps {
  onClose: () => void;
}

export default function CreateSecondMe({ onClose }: CreateSecondMeProps) {
  const router = useRouter();
  const [showTutorial, setShowTutorial] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateName = (value: string) => {
    if (value.length < 2 || value.length > 20) {
      setNameError('名称长度必须在 2 到 20 个字符之间');

      return false;
    }

    if (value.includes(' ')) {
      setNameError('名称不能包含空格');

      return false;
    }

    setNameError('');

    return true;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setName(value);
    validateName(value);
  };

  const validateEmail = (value: string) => {
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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateName(name) || !validateEmail(email)) return;

    createLoadInfo({
      name,
      description,
      email
    })
      .then((res) => {
        if (res.data.code !== 0) {
          throw new Error(res.data.message);
        } else {
          // Store in localStorage for registration check
          localStorage.setItem(
            'upload',
            JSON.stringify({
              name,
              description,
              email
            })
          );

          message.success('身份创建成功');

          setTimeout(() => {
            router.push(ROUTER_PATH.DASHBOARD);
          }, 300);
        }
      })
      .catch((error: Error) => {
        message.error(error.message);
      });
  };

  return (
    <>
      {showTutorial ? (
        <OnboardingTutorial onClose={onClose} onComplete={() => setShowTutorial(false)} />
      ) : (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-secondme-warm-bg rounded-2xl p-10 max-w-2xl w-full shadow-2xl border-2 border-gray-800/10 relative overflow-hidden">
            {/* Background gradient decorations */}
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-orange-50 opacity-70" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-orange-50 opacity-70" />
            <div className="space-y-6 relative z-10">
              <div className="mb-6">
                <h1 className="text-3xl font-bold mb-3 text-gray-900">定义你的身份</h1>
                <p className="text-lg text-gray-600 leading-relaxed max-w-xl">
                  这个初始身份代表你的核心自我。你可以在后续步骤中进一步扩展它。
                </p>
              </div>
              <form className="space-y-6 mt-6" onSubmit={handleSubmit}>
                <div>
                  <label
                    className="block text-[15px] font-medium text-gray-700 font-sans"
                    htmlFor="name"
                  >
                    分身名称
                  </label>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed font-sans">
                    这个名字将代表你和你的分身。
                  </p>
                  <input
                    className={`mt-1.5 block w-full px-4 py-2.5 rounded-lg border bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.03)] focus:border-gray-400 focus:ring-2 focus:ring-gray-400/20 transition-all font-sans text-[15px] placeholder:text-gray-400 placeholder:text-[15px] ${nameError ? 'border-red-500' : 'border-gray-800/10'}`}
                    id="name"
                    onChange={handleNameChange}
                    placeholder="例如：Felix（不允许空格）"
                    required
                    type="text"
                    value={name}
                  />
                  {nameError && <p className="mt-1 text-xs text-red-500">{nameError}</p>}
                </div>
                <div>
                  <label
                    className="block text-[15px] font-medium text-gray-700 font-sans"
                    htmlFor="description"
                  >
                    Short Personal Description
                  </label>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed font-sans">
                    简要描述你自己：性格、动机或风格。
                  </p>
                  <textarea
                    className="mt-1.5 block w-full px-4 py-2.5 rounded-lg border border-gray-800/10 bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.03)] focus:border-gray-400 focus:ring-2 focus:ring-gray-400/20 transition-all font-sans text-[15px] placeholder:text-gray-400 placeholder:text-[15px] resize-none h-28 leading-relaxed"
                    id="description"
                    maxLength={200}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="例如：'喜欢冒险、数据驱动，喜欢学习新技术。'"
                    rows={4}
                    value={description}
                  />
                </div>
                <div>
                  <label
                    className="block text-[15px] font-medium text-gray-700 font-sans"
                    htmlFor="email"
                  >
                    分身邮箱
                  </label>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed font-sans">
                    此邮箱将用作你的分身的联系方式。你可以使用自己的邮箱地址。
                  </p>
                  <input
                    className={`mt-1.5 block w-full px-4 py-2.5 rounded-lg border bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.03)] focus:border-gray-400 focus:ring-2 focus:ring-gray-400/20 transition-all font-sans text-[15px] placeholder:text-gray-400 placeholder:text-[15px] ${emailError ? 'border-red-500' : 'border-gray-800/10'}`}
                    id="email"
                    onChange={handleEmailChange}
                    placeholder="例如：your.name@example.com"
                    required
                    type="email"
                    value={email}
                  />
                  {emailError && <p className="mt-1 text-xs text-red-500">{emailError}</p>}
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-800/10">
                  <button
                    className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                    onClick={onClose}
                    type="button"
                  >
                    取消
                  </button>
                  <button
                    className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)]"
                    type="submit"
                  >
                    创建
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
