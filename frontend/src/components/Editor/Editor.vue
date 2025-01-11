<script setup>
import * as monaco from 'monaco-editor'
import { ref, onMounted } from 'vue'
// @ts-ignore
import { customLangMonarch, keywords, tools } from './custom-lang'
import {
    DragCol,
    DragRow,
    ResizeCol,
    ResizeRow,
    Resize,
} from "vue-resizer";
import { runCode, stopCode, analyzeCode } from '@/js/api'

monaco.languages.register({ id: 'farmBotScript' })
monaco.languages.setMonarchTokensProvider('farmBotScript', customLangMonarch)

monaco.languages.registerCompletionItemProvider("farmBotScript", {
    provideCompletionItems: (model, position) => {
        var word = model.getWordUntilPosition(position);
        var range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
        };

        var suggestions = [
            ...keywords.map((keyword) => {
                return {
                    label: keyword.key,
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: keyword.snipet,
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    range: range,
                };
            }),
            ...tools.map((tool) => {
                return {
                    label: tool,
                    kind: monaco.languages.CompletionItemKind.Enum,
                    insertText: tool,
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    range: range,
                };
            }),
            ...["true", "false"].map((bool) => {
                return {
                    label: bool,
                    kind: monaco.languages.CompletionItemKind.Value,
                    insertText: bool,
                    insertTextRules:
                        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    range: range,
                };
            })
        ];
        return { suggestions };
    },
});

let topPercent = ref(80)

let logs = ref([])
const editor = ref()
let codeEditor = ref()

function undo() {
    codeEditor.trigger('editor', 'undo')
}

function redo() {
    codeEditor.trigger('editor', 'redo')
}

function clearConsole() {
    logs.value = []
}

function _runCode() {
    let code = codeEditor.getValue()

    runCode(code)
        .then((response) => {
            console.log("Code response : ", response)
        }).catch((error) => {
            console.log("Code error : ", error);
        });
}

function _stopCode() {
    stopCode()
}

function validate(codeEditor) {
    let model = codeEditor.getModel()
    let markers = [];


    let code = codeEditor.getValue()
    analyzeCode(code)
        .then((response) => {
            console.log("Code response : ", response.data)
            let responseData = response.data

            if (!responseData.successful) {
                let parseError = responseData.parseError

                markers.push({
                    message: `Unexpected input. Expected: ${parseError.expected.map(e => `'${e}'`).join(" or ")}`,
                    severity: monaco.MarkerSeverity.Error,
                    startLineNumber: parseError.line,
                    startColumn: parseError.col,
                    endLineNumber: parseError.line,
                    endColumn: model.getLineLength(parseError.line) + 1,
                });
                addLog(parseError.message, parseError.date)
            } else {
                markers = []
            }

            monaco.editor.setModelMarkers(model, "owner", markers);
        }).catch((error) => {
            console.log("Code error : ", error);
        });
}

function addLog(message, date){
    logs.value.unshift({
        time: date,
        message
    })
}

onMounted(() => {
    codeEditor = monaco.editor.create(editor.value, {
        value: `
move(x:100,y:200,z:-80)

move(z:-120)

control(pin:7,state:true)

home(x:false,y:true,z:false)

pick(tool:seeder)
        `,
        language: 'farmBotScript',
    })

    codeEditor.getModel().onDidChangeContent((event) => {
        validate(codeEditor)
    });
})
</script>

<template>
    <div class="tw-flex tw-flex-col tw-w-full tw-h-full">
        <DragRow :topPercent="topPercent" height="100%" width="100%">
            <template #top>
                <div class="tw-flex tw-flex-col tw-h-full">
                    <div class="tw-flex tw-flex-row tw-p-2 tw-bg-zinc-950 tw-justify-between tw-items-center">
                        <div class="tw-flex tw-flex-row tw-space-x-2">
                            <v-btn icon="mdi-undo" density="compact" variant="outlined" color="white" size="small"
                                @click="undo"></v-btn>
                            <v-btn icon="mdi-redo" density="compact" variant="outlined" color="white" size="small"
                                @click="redo"></v-btn>
                        </div>
                        <div class="tw-flex tw-flex-row tw-space-x-2 tw-items-center">
                            <v-btn icon="mdi-stop-circle-outline" density="compact" variant="tonal" color="red"
                                @click="_stopCode"></v-btn>
                            <v-btn icon="mdi-play" density="compact" variant="tonal" color="green"
                                @click="_runCode"></v-btn>
                        </div>
                    </div>
                    <div id="editor" ref="editor" class="tw-flex-1 tw-w-full"></div>
                </div>
            </template>

            <template #bottom>
                <div class="tw-flex tw-flex-col tw-bottom-0 tw-w-full tw-h-full tw-z-20">
                    <div class="tw-flex tw-flex-row tw-p-2 tw-bg-zinc-950 tw-justify-between tw-items-center">
                        <div class="tw-flex tw-flex-row tw-space-x-2">
                            <v-btn icon="mdi-trash-can-outline" density="compact" variant="outlined" color="white"
                                size="small" @click="clearConsole"></v-btn>
                        </div>
                        <div class="tw-flex tw-flex-row tw-space-x-2 tw-items-center">
                        </div>
                    </div>
                    <div class="tw-flex-1 tw-bg-gray-200 tw-relative">
                        <div
                            class="tw-absolute tw-overflow-hidden tw-overflow-y-auto tw-top-0 tw-bottom-0 tw-left-0 tw-right-0 tw-p-2">
                            <div class="tw-flex tw-flex-col tw-space-y-4">
                                <div v-for="(log, i) in logs" :key="i"
                                    class="tw-flex tw-flex-col tw-space-x-3 tw-text-sm tw-subpixel-antialiased tw-font-light tw-border-b-2 tw-border-dashed tw-border-violet-500 tw-pb-2">
                                    <span class="tw-text-violet-500 tw-font-normal">{{ log.time }}</span>
                                    <span class="tw-whitespace-pre tw-pl-2" v-html="log.message"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </DragRow>
    </div>
</template>

<style scoped></style>
