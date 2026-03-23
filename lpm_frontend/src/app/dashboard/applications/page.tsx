'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useMemo } from 'react';
import { ROUTER_PATH } from '@/utils/router';
import { useLoadInfoStore } from '@/store/useLoadInfoStore';
import { EVENT } from '@/utils/event';

interface ApplicationCard {
  title: string;
  subtitle?: string;
  description: string;
  image: string;
  route: string;
}

const applications: ApplicationCard[] = [
  {
    title: 'API & MCP',
    description:
      'API 和 MCP 允许你构建自定义分身应用并扩展其功能。',
    image: '/images/app_api_mcp.png',
    route: ROUTER_PATH.APPLICATIONS_API_MCP
  },
  {
    title: '角色扮演应用',
    description:
      '赋予你的分身不同的角色，让它在各种场景中自然地表达自己。',
    image: '/images/app_secondme_apps.png',
    route: ROUTER_PATH.APPLICATIONS_ROLEPLAY
  },
  {
    title: '网络应用',
    description:
      '创建多个分身协同工作的空间，共同完成任务。',
    image: '/images/app_secondme_network.png',
    route: ROUTER_PATH.APPLICATIONS_NETWORK
  },
  {
    title: 'Second X 应用',
    description:
      '为分身原生构建的未来服务：Second Tinder、Second LinkedIn 等。',

    // description: 'Envision a world where software services are built to serve your digital self. "Second X" is our vision for next-gen apps that support Second Me agents directly. Stay tuned—this feature is not yet available.',
    image: '/images/app_native_applications.png',
    route: ROUTER_PATH.APPLICATIONS_SECOND_X
  },
  {
    title: '集成',
    description: '将分身与其他服务集成以扩展其功能。',
    image: '/images/step_2.png',
    route: ROUTER_PATH.APPLICATIONS_INTEGRATIONS
  }
];

export default function ApplicationsPage() {
  const router = useRouter();
  const loadInfo = useLoadInfoStore((state) => state.loadInfo);
  const isRegistered = useMemo(() => {
    return loadInfo?.status === 'online';
  }, [loadInfo]);

  return (
    <div className="h-full w-full flex flex-col p-4 pt-12">
      <div className="max-w-6xl w-full mx-auto">
        <div className="mb-14">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            分身是构建你的身份应用的基础
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            除了基本对话，你还可以创建专门的角色、个性化任务、在多 AI 空间中协作，或探索 Second X 的未来。
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pb-4">
          {applications.map((app, index) => (
            <div
              key={index}
              className={`rounded-2xl overflow-hidden border-2 border-gray-800/10 hover:border-gray-800/20 
                      transition-all cursor-pointer bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] 
                      hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.08)] hover:-translate-y-0.5
                      ${!app.route && 'opacity-90 cursor-not-allowed'}`}
              onClick={() => {
                if (!isRegistered) {
                  dispatchEvent(new Event(EVENT.SHOW_REGISTER_MODAL));
                } else if (app.route) {
                  router.push(app.route);
                }
              }}
            >
              <div className="relative w-full pt-[80%] group">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 group-hover:to-black/10 transition-all" />
                <Image
                  alt={app.title}
                  className="object-cover absolute inset-0 transition-transform group-hover:scale-105 object-center"
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  src={app.image}
                />
              </div>
              <div className="p-4 bg-gradient-to-b from-white to-gray-50">
                <h2 className="text-base font-semibold mb-1.5 text-gray-800">{app.title}</h2>
                {app.subtitle && <p className="text-sm text-gray-600 mb-1.5">{app.subtitle}</p>}
                <p className="text-sm text-gray-600/90 leading-relaxed">{app.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
