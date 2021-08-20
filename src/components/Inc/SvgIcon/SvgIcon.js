
import * as p from './path';
export const path = p
export default function (props) {
    const path = (props.path || p.mdiHelpRhombusOutline);
    return <svg onClick={props.onClick} className={props.className} style={props.style} width={24} height={24} viewBox={`0 0 ${path.w || 24} ${path.h || 24}`}>
        <path fill={props.fill || path.fill || ''} d={path.d} />
    </svg>
}
