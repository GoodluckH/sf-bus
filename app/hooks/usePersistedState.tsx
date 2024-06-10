import { Dispatch, SetStateAction, useEffect, useState } from "react";

type PersistedState<T> = [T, Dispatch<SetStateAction<T>>];

function usePersistedState<T>(defaultValue: T, key: string): PersistedState<T> {
  const [value, setValue] = useState<T>(defaultValue);
  const [settingInitialValue, setSettingInitialValue] = useState(true);

  useEffect(() => {
    const item = window.localStorage.getItem(key);
    if (item) {
      setValue(JSON.parse(item));
    }
    setSettingInitialValue(false);
  }, []);

  useEffect(() => {
    if (!settingInitialValue)
      window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value, settingInitialValue]);

  return [value, setValue];
}

export { usePersistedState };
