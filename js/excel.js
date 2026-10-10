window.readRXTExcel = async function (buffer, source) {
  const wb = XLSX.read(buffer, {
    type: "array",
    cellDates: true,
    cellFormula: true,
  });
  const name = wb.SheetNames.find(
    n => RXT.norm(n) === RXT.norm("Tổng hợp RXT - Bình Thạnh")
  );

  if (!name) throw Error('Không tìm thấy sheet "Tổng hơp RXT - Bình Thạnh". Không tự đọc sheet (2) hoặc Tạm cư.');

  const ws = wb.Sheets[name],
    rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null, raw: true });
  const { cols, start } = RXT.mapping(rows);
  for (let r = start; r < rows.length; r++)
    if (rows[r][cols.name] && rows[r][cols.stt] != null) {
      for (const k in cols)
        if (RXT.isMoneyField(k)) {
          const cell = ws[XLSX.utils.encode_cell({ r, c: cols[k] })];
          if (cell?.f && (cell.v == null || cell.t === "e"))
            throw Error(
              "Công thức tiền tại dòng " +
                (r + 1) +
                " chưa có kết quả hợp lệ. Mở Excel, tính lại và lưu file rồi nhập lại.",
            );
        }
    }
  const warningName = wb.SheetNames.find(
    (n) => n !== name && RXT.norm(wsTitle(wb.Sheets[n])).includes("khong khop"),
  );
  const warnings = warningName
    ? XLSX.utils
        .sheet_to_json(wb.Sheets[warningName], { header: 1, defval: null })
        .slice(3)
        .filter((r) => r[6])
    : [];
  return { rows, sheet: name, warnings, source };
  function wsTitle(s) {
    return s.A1?.v || "";
  }
};
// IndexedDB lưu file đã nhập chỉ trên trình duyệt hiện tại; không phải dữ liệu chia sẻ cho người khác.
window.rxtStore = async function (action, value) {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("rxt-local-excel", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("files");
    req.onerror = () => reject(req.error);
    req.onsuccess = () => {
      const db = req.result,
        tx = db.transaction(
          "files",
          action === "get" ? "readonly" : "readwrite",
        ),
        store = tx.objectStore("files");
      let q =
        action === "get"
          ? store.get("current")
          : action === "delete"
            ? store.delete("current")
            : store.put(value, "current");
      let result;
      q.onsuccess = () => (result = q.result);
      tx.oncomplete = () => {
        db.close();
        resolve(result);
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    };
  });
};
