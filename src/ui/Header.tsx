import { Bars, Gear } from "@styled-icons/fa-solid";
import styled from "styled-components";
import { useState } from "react";
import { useStore } from "../lib/store";
import { preferenceOptions } from "../lib/data";

export function Header() {
  const [displayPreference, setDisplayPreference] = useState(false);
  const [preference, setPreferences] = useStore((state) => [
    state.preferences,
    state.setPreferences,
  ]);

  return (
    <HeaderWrapper>
      <h1>Visual Logic</h1>
      <div style={{ position: "relative", marginLeft: "auto" }}>
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
        onClick={() =>
          setPreferences({ sidebarDisplay: !preference.sidebarDisplay })
        }
      />
    </HeaderWrapper>
  );
}

const PreferenceDropdown = styled.div`
  position: absolute;
  min-width: 125px;
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
