'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import getOAuthData from '@apis/oauth/getOAuthData';
import { REDIRECT_URL_SIGN_IN_COMPLETE, REDIRECT_URL_SIGN_IN_INCOMPLETE } from '@constants/redirectUrls';
import { useOAuthStore } from '@stores/useOAuthStore';
import { useUserStore } from '@stores/userStore';

interface providerType {
  provider: 'naver' | 'kakao' | 'google';
}

export default function AwaitSignin({ params }: { params: providerType }) {
  const { signin, signout, setBlobId } = useUserStore();
  const { setOAuth } = useOAuthStore();

  const router = useRouter();
  const code = typeof window !== 'undefined' ? new URL(window.location.href).searchParams.get('code') : null;

  useEffect(() => {
    function storeOAuth(blobId: string, accessToken: string, refreshToken: string, state: string) {
      document.cookie = `accessToken=${accessToken}; path=/`;
      document.cookie = `refreshToken=${refreshToken}; path=/`;
      setOAuth(blobId, accessToken, refreshToken, state);

      setBlobId(blobId);
    }

    async function setOAuthData() {
      const { data } = await getOAuthData(params.provider, code);
      const { blobId, accessToken, refreshToken, state } = data;

      storeOAuth(blobId, accessToken, refreshToken, state);

      return state;
    }

    async function redirectBasedOnState() {
      const state = await setOAuthData();
      console.log(state);

      if (state === 'COMPLETE') {
        signin();
        router.push(REDIRECT_URL_SIGN_IN_COMPLETE);
      } else if (state === 'INCOMPLETE') {
        router.push(REDIRECT_URL_SIGN_IN_INCOMPLETE);
      }
    }

    redirectBasedOnState();
  }, [code, params.provider, router, setBlobId, signin, signout, setOAuth]);

  return (
    <>
      <h1>{`This is OAUTH - ${params.provider} test page`}</h1>
    </>
  );
}
