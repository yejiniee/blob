'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import getOAuthData from '@apis/oauth/getOAuthData';
import { useOAuthStore } from '@stores/useOAuthStore';

interface providerType {
  provider: 'naver' | 'kakao' | 'google';
}

export default function LoadingSignin({ params }: { params: providerType }) {
  const router = useRouter();
  // const code = new URL(window.location.href).searchParams.get('code');
  const code = typeof window !== 'undefined' ? new URL(window.location.href).searchParams.get('code') : null;

  function storeOAuth(oauthId: string, accessToken: string, refreshToken: string, state: string) {
    document.cookie = `accessToken=${accessToken}; path=/`;
    document.cookie = `refreshToken=${refreshToken}; path=/`;

    useOAuthStore.setState({ oauthId, accessToken, refreshToken, state });
  }

  useEffect(() => {
    async function setOAuthData() {
      const { data } = await getOAuthData(params.provider, code);

      const { oauthId, accessToken, refreshToken, state } = data;

      storeOAuth(oauthId, accessToken, refreshToken, state);
      console.log('data', data);
    }

    setOAuthData();

    router.push('/signin');
  }, [code, params.provider, router]);

  return <h1>{`This is OAUTH - ${params.provider} test page`}</h1>;
}
