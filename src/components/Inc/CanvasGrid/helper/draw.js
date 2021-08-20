import { path } from '../../SvgIcon';

export function drawPath2D(params, svgPath, x, y, w, h) {
    const { gc } = params;
    const p = new Path2D();
    const min = Math.min(w / (svgPath.w || 24), h / (svgPath.h || 24));
    p.addPath(new Path2D(svgPath.d), {
        a: min,
        d: min,
        e: x + 0.5,
        f: y + 0.5
    });
    gc.fill(p);
}
export function drawProgressAlert(params, x, y, w, h) {
    drawPath2D(params, path.mdiProgress, x, y, w, h);
}
export function drawProgressPending(params, x, y, w, h) {
    drawPath2D(params, path.progressPending, x, y, w, h);
}
export function drawLockout(params, x, y, w, h) {
    drawPath2D(params, path.mdiLock, x, y, w, h);
}
export function drawCalendar(params, x, y, w, h) {
    drawPath2D(params, path.mdiCalendarBlank, x, y, w, h);
}
export function drawSwitchOff(params, x, y, w, h) {
    drawPath2D(params, path.mdiToggleSwitchOff, x, y, w, h);
}
export function drawSwitch(params, x, y, w, h) {
    drawPath2D(params, path.mdiToggleSwitch, x, y, w, h);
}
export function drawSearch(params, x, y, w, h) {
    drawPath2D(params, path.mdiMagnify, x, y, w, h);
}
export function drawDownload(params, x, y, w, h) {
    drawPath2D(params, path.mdiDownload, x, y, w, h);
}
export function drawSquareCheckbox(params, x, y, w, h) {
    drawPath2D(params, path.mdiCheckBoxOutline, x, y, w, h);
}
export function drawUncheckSquare(params, x, y, w, h) {
    drawPath2D(params, path.mdiCheckboxBlankOutline, x, y, w, h);
}
export function drawActiveIcon(params, x, y, w, h) {
    drawPath2D(params, path.mdiCheckCircle, x, y, w, h);
}
export function drawCloseIcon(params, x, y, w, h) {
    drawPath2D(params, path.mdiCloseCircle, x, y, w, h);
}
export function drawPendingIcon(params, x, y, w, h) {
    drawPath2D(params, path.mdiRestart, x, y, w, h);
}
export function drawMenuIcon(params, x, y, w, h) {
    drawPath2D(params, path.mdiMenu, x, y, w, h);
}
export function drawFilter(params, x, y, w, h) {
    drawPath2D(params, path.mdiFilter, x, y, w, h)
}
export function drawCheck(params, x, y, w, h) {
    drawPath2D(params, path.mdiCheck, x, y, w, h)
}
export function drawCheckboxIntermediate(params, x, y, w, h) {
    drawPath2D(params, path.mdiCheckboxIntermediate, x, y, w, h)
}
export function drawCheckbox(params, x, y, w, h) {
    drawPath2D(params, path.mdiCheckboxMarkedOutline, x, y, w, h)
}
export function drawCheckboxEmpty(params, x, y, w, h) {
    drawPath2D(params, path.mdiCheckboxBlankOutline, x, y, w, h)
}
export function drawCheckCircle(params, x, y, w, h) {
    drawPath2D(params, path.mdiCheckboxMarkedCircle, x, y, w, h)
}
export function drawCloseCircle(params, x, y, w, h) {
    drawPath2D(params, path.mdiCloseCircle, x, y, w, h)
}
export function drawCheckPending(params, x, y, w, h) {
    drawPath2D(params, path.checkPending, x, y, w, h)
}
export function drawSortAsc(params, x, y, w, h) {
    drawPath2D(params, path.mdiSortAlphabeticalAscending, x, y, w, h)
}
export function drawSortDesc(params, x, y, w, h) {
    drawPath2D(params, path.mdiSortAlphabeticalDescending, x, y, w, h)
}
export function drawFlag(params, x, y, w, h) {
    drawPath2D(params, path.mdiFlag, x, y, w, h)
}
export function drawArrowUp(params, x, y, w, h) {
    drawPath2D(params, path.mdiChevronUp, x, y, w, h)
}
export function drawArrowDown(params, x, y, w, h) {
    drawPath2D(params, path.mdiChevronDown, x, y, w, h)
}
export function drawArrowRight(params, x, y, w, h) {
    drawPath2D(params, path.mdiChevronRight, x, y, w, h)
}
export function drawCartPlus(params, x, y, w, h) {
    drawPath2D(params, path.mdiCartPlus, x, y, w, h)
}
export function drawCartOff(params, x, y, w, h) {
    drawPath2D(params, path.mdiCartOff, x, y, w, h)
}
export function drawClose(params, x, y, w, h) {
    drawPath2D(params, path.mdiClose, x, y, w, h)
}
export function drawContrast(params, x, y, w, h) {
    drawPath2D(params, path.mdiContrast, x, y, w, h)
}
export function drawInformationOutline(params, x, y, w, h) {
    drawPath2D(params, path.mdiInformationOutline, x, y, w, h)
}
export function drawPlayListRemove(params, x, y, w, h) {
    drawPath2D(params, path.mdiPLaylistRemove, x, y, w, h)
}
export function drawDragBtn(params, x, y, w, h) {
    drawPath2D(params, path.dragBtn, x, y, w, h)
}
export function drawModifyBtn(params, x, y, w, h) {
    drawPath2D(params, path.mdiFileDocumentEditOutline, x, y, w, h)
}
export function drawLoading(params, x, y, w, h) {
    drawPath2D(params, path.loading, x, y, w, h)
}
export function drawCreatingAccount(params, x, y, w, h) {
    drawPath2D(params, path.creatingAccount, x, y, w, h)
}
export function drawEkycInProgress(params, x, y, w, h) {
    drawPath2D(params, path.ekycInProgress, x, y, w, h)
}
export function drawMdiBellIcon(params, x, y, w, h) {
    drawPath2D(params, path.mdiBellOutLine, x, y, w, h)
}
export function drawSmsIcon(params, x, y, w, h) {
    drawPath2D(params, path.smsIcon, x, y, w, h)
}
export function drawEmailIcon(params, x, y, w, h) {
    drawPath2D(params, path.mdiEmailOutline, x, y, w, h)
}

export function drawPalette(params, x, y, w, h) {
    drawPath2D(params, path.mdiPaletteOutline, x, y, w, h)
}

export function drawPen(params, x, y, w, h) {
    drawPath2D(params, path.mdiPen, x, y, w, h)
}

export function drawLoad(params, x, y, w, h) {
    drawPath2D(params, path.mdiLoad, x, y, w, h)
}
