import {registerRoot} from 'remotion';
import {Root} from './KitRoot';

// Studio entry. Named <stem>-entry.ts next to <Stem>Root.tsx so Studio's "Save default props" can find the root file.
registerRoot(Root);
