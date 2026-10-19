import {staticFile} from 'remotion';

// A media path as a URL: absolute URLs and root paths (an editor's uploaded media, e.g. /studio/api/media/<key>) pass
// through; anything else is a kit asset under public/ and goes through staticFile. Use this for every media prop.
export const asset = (p: string) => (/^(https?:|data:|blob:)/.test(p) || p.startsWith('/') ? p : staticFile(p));
