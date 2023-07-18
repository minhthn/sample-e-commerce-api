import { dirname } from 'node:path';
import { fileURLToPath } from 'url';

const getDirname = (URL) => {
    return dirname(fileURLToPath(URL));
}

export default getDirname;
