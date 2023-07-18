import { unlink } from 'node:fs/promises';

const removeFile = async (filePath) => {
    try {
        await unlink(filePath);
    } catch (error) {
        console.log(">> err:", err);
    }
}

export default removeFile;