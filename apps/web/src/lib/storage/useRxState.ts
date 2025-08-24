import { useEffect, useState } from 'react';
import { Observable, Subscription } from 'rxjs';

export default function useRxState<T>(observable: Observable<T> | undefined): T | undefined {
  const [data, setData] = useState<T>();

  useEffect(() => {
    if (!observable) return;
    
    const subscription: Subscription = observable.subscribe(setData);
    return () => subscription.unsubscribe();
  }, [observable]);

  return data;
}
