"use client";
import type { ForwardedRef } from "react";
import {
    headingsPlugin,
    listsPlugin,
    quotePlugin,
    thematicBreakPlugin,
    markdownShortcutPlugin,
    MDXEditor,
    type MDXEditorMethods,
    toolbarPlugin,
    ConditionalContents,
    ChangeCodeMirrorLanguage,
    UndoRedo,
    Separator,
    BoldItalicUnderlineToggles,
    ListsToggle,
    CreateLink,
    InsertImage,
    InsertTable,
    InsertThematicBreak,
    InsertCodeBlock,
    linkPlugin,
    linkDialogPlugin,
    tablePlugin,
    imagePlugin,
    codeBlockPlugin,
    codeMirrorPlugin,
    diffSourcePlugin,
} from "@mdxeditor/editor";
import "./dark-editor.css";
import { basicDark } from "cm6-theme-basic-dark";
import { useTheme } from "next-themes";
import "@mdxeditor/editor/style.css";

interface Props {
    value: string;
    fieldChange: (value: string) => void;
    editorRef: ForwardedRef<MDXEditorMethods> | null;
}

const Editor = ({ value, fieldChange, editorRef, ...props }: Props) => {
    const { resolvedTheme } = useTheme();
    const themeExtension = resolvedTheme === "dark" ? [basicDark] : [];
    return (
        <MDXEditor
            key={resolvedTheme}
            markdown={value}
            onChange={fieldChange}
            className="background-light800_dark200 light-border-2 markdown-editor dark-editor w-full grid border rounded-1.5"
            plugins={[
                headingsPlugin(),
                listsPlugin(),
                quotePlugin(),
                linkPlugin(),
                linkDialogPlugin(),
                tablePlugin(),
                imagePlugin(),
                codeBlockPlugin({ defaultCodeBlockLanguage: "" }),
                codeMirrorPlugin({
                    codeBlockLanguages: {
                        javascript: "javascript",
                        typescript: "typescript",
                        python: "python",
                        java: "java",
                        csharp: "C#",
                        go: "go",
                        ruby: "ruby",
                        php: "php",
                        html: "html",
                        css: "css",
                        json: "json",
                        txt: "txt",
                        sql: "sql",
                        saas: "saas",
                        bash: "bash",
                        scss: "scss",
                        tsx: "TypeScript (react)",
                        jsx: "JavaScript (react)",
                        "": "unset",
                    },
                    autoLoadLanguageSupport: true,
                    codeMirrorExtensions: themeExtension,
                }),
                diffSourcePlugin({
                    viewMode: "rich-text",
                    diffMarkdown: "",
                }),
                thematicBreakPlugin(),
                markdownShortcutPlugin(),
                toolbarPlugin({
                    toolbarContents: () => (
                        <ConditionalContents
                            options={[
                                {
                                    when: (editor) =>
                                        editor?.editorType === "codeblock",
                                    contents: () => (
                                        <ChangeCodeMirrorLanguage />
                                    ),
                                },
                                {
                                    fallback: () => (
                                        <>
                                            <UndoRedo />
                                            <Separator />
                                            <BoldItalicUnderlineToggles />
                                            <Separator />
                                            <ListsToggle />
                                            <Separator />
                                            <CreateLink />
                                            <InsertImage />
                                            <Separator />
                                            <InsertTable />
                                            <InsertThematicBreak />
                                            <InsertCodeBlock />
                                        </>
                                    ),
                                },
                            ]}
                        />
                    ),
                }),
            ]}
            {...props}
            ref={editorRef}
        />
    );
};

export default Editor;
