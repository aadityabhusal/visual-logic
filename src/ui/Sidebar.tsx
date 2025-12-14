import { FaGear, FaPlus, FaX } from "react-icons/fa6";
import { uiConfigStore, useProjectStore } from "../lib/store";
import { createProjectFile, handleSearchParams } from "../lib/utils";
import { NoteText } from "./NoteText";
import { IconButton } from "./IconButton";
import { SiGithub, SiYoutube } from "react-icons/si";
import { Popover } from "@mantine/core";
import { preferenceOptions } from "../lib/data";
import { useSearchParams } from "react-router";
import { ProjectFile } from "@/lib/types";
import { useState } from "react";
import { BaseInput } from "@/components/Input/BaseInput";

export function Sidebar({ projectFiles }: { projectFiles: ProjectFile[] }) {
  const { addFile, updateFile, deleteFile } = useProjectStore();
  const { setUiConfig, ...uiConfig } = uiConfigStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [editingId, setEditingId] = useState<string>();

  return (
    <div className="flex flex-col ml-auto w-40 border-r">
      <div className="p-1 flex gap-2 justify-between items-center border-b">
        <span>Operations</span>
        <IconButton
          size={16}
          icon={FaPlus}
          title="Add operation"
          onClick={() =>
            addFile(createProjectFile({ type: "operation" }, projectFiles))
          }
        >
          Add
        </IconButton>
      </div>
      <ul className="flex-1 p-1 overflow-y-auto dropdown-scrollbar list-none m-0">
        {!projectFiles.length && <NoteText center>Add an operation</NoteText>}
        {projectFiles.map((item) => (
          <li
            className={
              "flex items-center justify-between cursor-pointer p-1 hover:bg-dropdown-hover " +
              (item.id === searchParams.get("operationId")
                ? "bg-dropdown-hover"
                : "bg-editor")
            }
            key={item.id}
            onClick={() =>
              setSearchParams(
                ...handleSearchParams({ operationId: item.id }, true)
              )
            }
          >
            {editingId === item.id ? (
              <BaseInput
                autoFocus
                className="focus:outline outline-white"
                defaultValue={item.name}
                onFocus={() => setUiConfig({ navigation: undefined })}
                onBlur={(e) => {
                  if (e.target.value) {
                    updateFile(item.id, { name: e.target.value });
                  }
                  setEditingId(undefined);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.currentTarget.blur();
                }}
              />
            ) : (
              <span className="truncate" onClick={() => setEditingId(item.id)}>
                {item.name}
              </span>
            )}
            <IconButton
              icon={FaX}
              title="Delete operation"
              size={10}
              onClick={(e: MouseEvent) => {
                e.stopPropagation();
                deleteFile(item.id);
              }}
            />
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-3 p-2 border-t">
        <a
          href="https://www.youtube.com/watch?v=AOfOhNwQL64"
          target="_blank"
          rel="noreferrer"
          className="flex items-center select-none decoration-0"
          title="Demo video"
        >
          <span className="p-px mr-1 text-white">Demo</span>
          <SiYoutube size={20} />
        </a>
        <a
          href="https://github.com/aadityabhusal/logicflow"
          target="_blank"
          rel="noreferrer"
          style={{ display: "flex", userSelect: "none" }}
          title="Source code"
        >
          <SiGithub size={20} />
        </a>
        <Popover>
          <Popover.Target>
            <IconButton
              title="Settings"
              className="w-5 h-5 ml-auto"
              icon={FaGear}
            />
          </Popover.Target>
          <Popover.Dropdown
            classNames={{ dropdown: "absolute bg-editor border" }}
          >
            {preferenceOptions.map((item) => (
              <div
                className="flex justify-between items-center gap-4 py-1 px-2 border-b"
                key={item.id}
              >
                <label className="cursor-pointer" htmlFor={item.id}>
                  {item.label}
                </label>
                <input
                  id={item.id}
                  type="checkbox"
                  checked={uiConfig[item.id]}
                  onChange={(e) => setUiConfig({ [item.id]: e.target.checked })}
                />
              </div>
            ))}
          </Popover.Dropdown>
        </Popover>
      </div>
    </div>
  );
}
