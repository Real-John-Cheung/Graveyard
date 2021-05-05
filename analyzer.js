export function countImgTag(data) {
    if (typeof data !== 'string') return 0;
    return (data.match(/< *img/g) || []).length;
}