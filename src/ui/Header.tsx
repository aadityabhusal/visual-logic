import { SiGithub, SiYoutube } from "react-icons/si";
import { FaBars, FaGear } from "react-icons/fa6";
import { useEffect, useRef, useState } from "react";
import { uiConfigStore } from "../lib/store";
import { preferenceOptions } from "../lib/data";

export function Header() {
  const [displayPreference, setDisplayPreference] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { setUiConfig, ...uiConfig } = uiConfigStore();

  useEffect(() => {
    function clickHandler(e: MouseEvent) {
      if (!Boolean(ref.current?.contains(e.target as Node)))
        setDisplayPreference(false);
    }
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  }, [displayPreference]);

  return (
    <div className="border-b border-solid border-border p-2 flex items-center justify-between gap-4">
      <h1 style={{ marginRight: "auto" }}>Visual Logic</h1>
      <a
        href="https://www.youtube.com/watch?v=AOfOhNwQL64"
        target="_blank"
        style={{
          display: "flex",
          alignItems: "center",
          userSelect: "none",
          textDecoration: "none",
        }}
        title="Demo video"
      >
        <span style={{ padding: "1px", marginRight: "4px", color: "white" }}>
          Watch Demo
        </span>
        <SiYoutube size={16} />
      </a>
      <a
        href="https://github.com/aadityabhusal/visual-logic"
        target="_blank"
        style={{ display: "flex", userSelect: "none" }}
        title="Source code"
      >
        <SiGithub size={14} />
      </a>
      <div ref={ref} style={{ position: "relative" }}>
        <FaGear
          size={14}
          style={{ cursor: "pointer" }}
          onClick={() => setDisplayPreference((p) => !p)}
        />
        {displayPreference && (
          <div className="absolute min-w-[130px] top-6 right-0 border border-border border-solid z-10 bg-editor">
            {preferenceOptions.map((item) => (
              <div
                className="flex items-center p-0.5 border-b border-border border-solid"
                key={item.id}
              >
                <input
                  className="m-1"
                  id={item.id}
                  type="checkbox"
                  checked={uiConfig[item.id]}
                  onChange={(e) => setUiConfig({ [item.id]: e.target.checked })}
                />
                <label className="cursor-pointer text-xs" htmlFor={item.id}>
                  {item.label}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
      <FaBars
        size={14}
        style={{ cursor: "pointer" }}
        onClick={() => setUiConfig({ hideSidebar: !uiConfig.hideSidebar })}
      />
    </div>
  );
}
