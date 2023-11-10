// Copyright 2023 xObserve.io Team
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { useEffect, useRef } from 'react';

const useKeyEvent = (key: string, cb: (event: KeyboardEvent) => void) => {
  const callbackKey = useRef(cb);

  useEffect(() => {
    callbackKey.current = cb;
  });
  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if (event.code == key) {
        callbackKey.current(event);
      }
    };

    document.addEventListener('keypress', handle);
    return () => document.removeEventListener('keypress', handle);
  }, [key]);
};

export default useKeyEvent;