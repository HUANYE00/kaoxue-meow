/** 把内部核验摘要转成申请人可读文案（不出现 ISO / JSON 等词） */
export function verificationCopyForApplicant(summary) {
  const tone = summary?.tone
  if (tone === 'ok')
    return '本页关键日程已对照募集要项做过抽样核对；申请前请务必再以官网最新 PDF 为准。'
  if (tone === 'mixed')
    return '部分节点仍为「参考往年」或待官网更新；所有日期与区间请以当年募集要项 PDF 为准。'
  if (tone === 'warn')
    return '日程尚在陆续核对中；请务必直接查阅募集要项 PDF，不要仅以本站日期为准。'
  return '请以各校官网公布的募集要项为准。'
}

/** 从数据中挑一条最常用的募集要项 PDF 链接 */
export function pickPrimaryPdfUrl(school) {
  const urls = school?.officialUrls ?? []
  const pdfRow = urls.find(
    (o) =>
      /\.pdf(\?|$)/i.test(o.url ?? '') ||
      /募集要项|要項|PDF/i.test(o.label ?? ''),
  )
  return pdfRow?.url ?? urls[0]?.url ?? null
}
