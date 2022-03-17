import fs from "fs-extra"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const { readJSON, writeJSON, writeFile } = fs

const dataFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../data")
const filesPublicFolderPath = join(process.cwd(), "./public/img/files")

console.log("Data folder path: ", dataFolderPath)
console.log("Project foot folder: ", process.cwd())

const filesJSONPath = join(dataFolderPath, "files.json")

export const getFiles = () => readJSON(filesJSONPath)
export const writeFiles = content => writeJSON(filesJSONPath, content)