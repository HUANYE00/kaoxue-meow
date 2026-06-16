/** 首页最顶：产品价值一句话（与页脚免责声明区分，不写免责条款） */
export function ProductValueBar() {
  return (
    <div className="w-full border-b border-white/10 bg-[#111] text-white">
      <div className="mx-auto max-w-5xl px-4 py-2.5 text-center sm:px-6 sm:py-3">
        <p className="text-[13px] font-medium leading-snug text-white/95 sm:text-sm">
          考学喵 · 社会学修士出愿：把官网里的<strong className="font-semibold text-white">节点</strong>、
          <strong className="font-semibold text-white">材料</strong>与
          <strong className="font-semibold text-white">导师线索</strong>
          收成一份能推进会的时间表与清单。
        </p>
      </div>
    </div>
  )
}
