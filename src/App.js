import './App.css';
import { useEffect, useRef, useState } from 'react';
import {
  interval,
  Subject,
  takeUntil,
  buffer,
  fromEvent,
  filter,
  tap,
  map,
  debounceTime,
} from 'rxjs';

function useObservable(ref, event) {
  const [subject$, setSubject$] = useState();
  useEffect(() => {
    if (!ref.current) return;
    setSubject$(fromEvent(ref.current, event));
  }, [ref, event]);
  return subject$;
}

function useClick(mouseClicks$, setState) {
  useEffect(() => {
    if (!mouseClicks$) return;
    const subject$ = mouseClicks$
      .pipe(
        buffer(mouseClicks$.pipe(debounceTime(300))),
        tap((e) => console.log(e)),
        map((e) => e.length),
        filter((e) => e === 2),
      )
      .subscribe((e) => setState(false));
    return () => subject$.unsubscribe();
  }, [mouseClicks$, setState]);
}

function App() {
  const [time, setTime] = useState(0);
  const [enabled, setEnabled] = useState(false);

  const ref = useRef(null);
  const mouseClicks$ = useObservable(ref, 'click');
  useClick(mouseClicks$, setEnabled, enabled);

  const unsubscribe$ = new Subject();
  const timer$ = interval(1000).pipe(takeUntil(unsubscribe$));

  useEffect(() => {
    timer$.subscribe(() => {
      if (enabled) {
        setTime((val) => val + 1);
      }
    });

    return () => {
      unsubscribe$.next();
      unsubscribe$.complete();
    };
  }, [enabled, timer$, unsubscribe$]);

  function startHandler() {
    setEnabled(true);
  }

  function stopHandler() {
    setEnabled(false);
    setTime(0);
  }

  function resetHandler() {
    setTime(0);
  }

  return (
    <div className="app">
      <div className="watch">
        <span>{('0' + Math.floor((time / 3600) % 60)).slice(-2)}</span>
        &nbsp;:&nbsp;
        <span>{('0' + Math.floor((time / 60) % 60)).slice(-2)}</span>
        &nbsp;:&nbsp;
        <span>{('0' + Math.floor(time % 60)).slice(-2)}</span>
      </div>
      <div className="buttons">
        <button
          onClick={enabled ? stopHandler : startHandler}
          className={enabled ? 'stop' : ''}
          title={enabled ? 'Stop' : 'Start'}
        >
          {/*{enabled ? 'Stop' : 'Start'}*/}
          {enabled ? (
            <span className="fas fa-stop"></span>
          ) : (
            <span className="fas fa-play"></span>
          )}
        </button>
        <button ref={ref} title="Wait">
          {/*Wait*/}
          <span className="fas fa-pause"></span>
        </button>
        <button onClick={resetHandler} title="Reset">
          {/*Reset*/}
          <span className="fas fa-sync-alt"></span>
        </button>
      </div>
    </div>
  );
}

export default App;
