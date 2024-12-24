import { Bars, Code, Gear } from "@styled-icons/fa-solid";
import styled from "styled-components";
import { useEffect, useRef, useState } from "react";
import { useStore } from "../lib/store";
import { preferenceOptions } from "../lib/data";
import github from "./github.svg";
import youtube from "./youtube.svg";

export function Header() {
  const [displayPreference, setDisplayPreference] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [preference, setPreferences] = useStore((state) => [
    state.preferences,
    state.setPreferences,
  ]);

  useEffect(() => {
    function clickHandler(e: MouseEvent) {
      if (!Boolean(ref.current?.contains(e.target as Node)))
        setDisplayPreference(false);
    }
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  }, [displayPreference]);

  return (
    <HeaderWrapper>
      <h1 style={{ marginRight: "auto" }}>Visual Logic</h1>
      <a
        href="https://www.youtube.com/watch?v=AOfOhNwQL64"
        target="_blank"
        style={{
          display: "flex",
          userSelect: "none",
          textDecoration: "none",
        }}
        title="Demo video"
      >
        <span style={{ padding: "1px", marginRight: "4px", color: "white" }}>
          Watch Demo
        </span>
        <img src={youtube} width={18} height={18} />
      </a>
      <a
        href="https://github.com/aadityabhusal/visual-logic"
        target="_blank"
        style={{ display: "flex", userSelect: "none" }}
        title="Source code"
      >
        <img src={github} width={16} height={16} />
      </a>
      <div ref={ref} style={{ position: "relative" }}>
        <Gear
          size={14}
          style={{ cursor: "pointer" }}
          onClick={() => setDisplayPreference((p) => !p)}
        />
        {displayPreference && (
          <PreferenceDropdown>
            {preferenceOptions.map((item) => (
              <div key={item.id}>
                <input
                  id={item.id}
                  type="checkbox"
                  checked={preference[item.id]}
                  onChange={(e) =>
                    setPreferences({ [item.id]: e.target.checked })
                  }
                />
                <label htmlFor={item.id}>{item.label}</label>
              </div>
            ))}
          </PreferenceDropdown>
        )}
      </div>
      <Bars
        size={14}
        style={{ cursor: "pointer" }}
        onClick={() => setPreferences({ hideSidebar: !preference.hideSidebar })}
      />
    </HeaderWrapper>
  );
}

const PreferenceDropdown = styled.div`
  position: absolute;
  min-width: 130px;
  top: 1.5rem;
  right: 0;
  border: 1px solid ${({ theme }) => theme.color.border};
  z-index: 1;
  background-color: ${({ theme }) => theme.background.editor};

  & > div {
    display: flex;
    align-items: center;
    padding: 2px;
    border-bottom: 1px solid ${({ theme }) => theme.color.border};
    & > label {
      cursor: pointer;
      font-size: 0.8rem;
    }
  }
`;

const HeaderWrapper = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.color.border};
  padding: 0 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;
