// 定数定義
const EXTENSION_CONFIG = {
  SELECTORS: {
    MOUSEMOVE_CELLS: "td[onmousemove]",
    HEADER_ROWS: "tr.bgcolor_table_head",
    TABLE_CELLS: "td",
    TABLE_ROWS: "tr",
    REMARKS_INPUT: "input#remarks",
    INKAN_TD: "td[id*='inkan']",
    INKAN_IMAGES: "td[id*='inkan'] img",
  },
  REGEX: {
    POPUP_CONTENT: /showPopup\(event,'(.*)'\);/,
  },
  HTML_ENTITIES: {
    "&lt;": "<",
    "&gt;": ">",
    "&apos;": "'",
    "&quot;": '"',
    "&amp;": "&",
  },
  STYLES: {
    HIDE: "none",
    IMPROVED_FONT: `
      body, td, th, input, textarea, select, button {
        font-family: "Yu Gothic UI", "Meiryo UI", "Hiragino Kaku Gothic ProN", "BIZ UDPGothic", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif !important;
        font-size: 14px !important;
        padding: 1.5px 10px;
      }
      table {
        font-family: "Yu Gothic UI", "Meiryo UI", "Hiragino Kaku Gothic ProN", "BIZ UDPGothic", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif !important;
      }
      .small, small {
        font-size: 12px !important;
      }
      h1, h2, h3, h4, h5, h6 {
        font-family: "Yu Gothic UI", "Meiryo UI", "Hiragino Kaku Gothic ProN", "BIZ UDPGothic", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif !important;
        font-weight: 600 !important;
      }
    `,
  },
};

// デフォルト設定
const DEFAULT_SETTINGS = {
  extensionEnabled: true,
  showPopupContent: true,
  hideColumns: true,
  removeHeaders: true,
  resizeImages: true,
  expandRemarks: true,
  improveFont: true,
  columnsToHide: [
    "遅刻",
    "早退",
    "休憩時間",
    "実働時間",
    "所定内労働",
    "残業時間",
    "勤務",
    "有休時間",
    "状況区分",
    "法定外休出",
    "所定内深夜",
    "深夜労働",
    "法定内残業",
    "出社３",
    "退社３",
  ],
};

// HTML エンティティをデコード
function decodeHtmlEntities(str) {
  return Object.entries(EXTENSION_CONFIG.HTML_ENTITIES).reduce(
    (result, [entity, char]) => result.replace(new RegExp(entity, "g"), char),
    str
  );
}

// ポップアップ内容を抽出
function extractPopupContent(htmlString) {
  const match = htmlString.match(EXTENSION_CONFIG.REGEX.POPUP_CONTENT);
  if (!match || !match[1]) return "";

  const decoded = decodeHtmlEntities(match[1]);
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = decoded;

  const secondRow = tempDiv.querySelectorAll(
    EXTENSION_CONFIG.SELECTORS.TABLE_ROWS
  )[1];
  const secondTd = secondRow
    ? secondRow.querySelector(EXTENSION_CONFIG.SELECTORS.TABLE_CELLS)
    : null;

  return secondTd ? secondTd.textContent.trim() : "";
}

// ポップアップ内容を直接表示する機能
function showPopupContent() {
  document
    .querySelectorAll(EXTENSION_CONFIG.SELECTORS.MOUSEMOVE_CELLS)
    .forEach((td) => {
      const htmlString = td.getAttribute("onmousemove");
      const finalText = extractPopupContent(htmlString);

      if (finalText) {
        td.textContent = finalText;
        td.style.whiteSpace = "nowrap";
        td.style.overflow = "visible";
        td.style.textOverflow = "unset";
      }
    });
}

// 特定の列のインデックスを取得
function getColumnsToHideIndexes(headerCells, columnsToHide) {
  const indexes = [];
  headerCells.forEach((cell, index) => {
    const cellText = cell.textContent.trim();
    if (columnsToHide.some((hideText) => cellText.includes(hideText))) {
      indexes.push(index);
      cell.style.display = EXTENSION_CONFIG.STYLES.HIDE;
    }
  });
  return indexes;
}

// データ行の指定列を非表示
function hideDataRowCells(table, columnsToHideIndexes) {
  const allRows = table.querySelectorAll(EXTENSION_CONFIG.SELECTORS.TABLE_ROWS);
  allRows.forEach((row) => {
    if (!row.classList.contains("bgcolor_table_head")) {
      const dataCells = row.querySelectorAll(
        EXTENSION_CONFIG.SELECTORS.TABLE_CELLS
      );
      columnsToHideIndexes.forEach((colIndex) => {
        if (dataCells[colIndex]) {
          dataCells[colIndex].style.display = EXTENSION_CONFIG.STYLES.HIDE;
        }
      });
    }
  });
}

// 不要な列を削除する機能
function hideUnnecessaryColumns(columnsToHide) {
  const headerRows = document.querySelectorAll(
    EXTENSION_CONFIG.SELECTORS.HEADER_ROWS
  );

  headerRows.forEach((headerRow) => {
    const headerCells = headerRow.querySelectorAll(
      EXTENSION_CONFIG.SELECTORS.TABLE_CELLS
    );
    const columnsToHideIndexes = getColumnsToHideIndexes(
      headerCells,
      columnsToHide
    );

    const table = headerRow.closest("table");
    if (table && columnsToHideIndexes.length > 0) {
      hideDataRowCells(table, columnsToHideIndexes);
    }
  });
}

// 月中の重複ヘッダー行を削除する機能
function removeIntermediateHeaders() {
  const headerRows = document.querySelectorAll(
    EXTENSION_CONFIG.SELECTORS.HEADER_ROWS
  );

  headerRows.forEach((headerRow, index) => {
    // 最初のヘッダー行は残す
    if (index === 0) return;

    // 合計行は残す
    const isSummaryRow = headerRow.textContent.includes("合計");
    if (!isSummaryRow) {
      headerRow.style.display = EXTENSION_CONFIG.STYLES.HIDE;
    }
  });
}

// 印鑑画像のサイズを縮小
function resizeImages() {
  // 印鑑（承認印）が含まれるtd要素内の画像のみを対象にする
  document
    .querySelectorAll(EXTENSION_CONFIG.SELECTORS.INKAN_IMAGES)
    .forEach((img) => {
      // 既に縮小済みの場合はスキップ
      if (img.dataset.resized) return;
      
      // 画像を小さくする
      img.style.width = '10px';
      img.style.height = '10px';
      img.style.maxWidth = '10px';
      img.style.maxHeight = '10px';
      
      // 縮小済みマークを設定
      img.dataset.resized = 'true';
    });
}

// remarksインプットボックスを800pxに拡張する機能
function expandRemarksInput() {
  const remarksInput = document.querySelector(EXTENSION_CONFIG.SELECTORS.REMARKS_INPUT);
  
  if (remarksInput && !remarksInput.dataset.expandedRemarks) {
    // 元の属性を保存
    const originalWidth = remarksInput.style.width || remarksInput.getAttribute('size') || '10';
    
    // 800pxの大きなスタイルを適用
    remarksInput.style.width = '800px';
    remarksInput.style.minWidth = '400px';
    remarksInput.style.maxWidth = '1000px';
    remarksInput.style.padding = '3px 6px';
    remarksInput.style.fontSize = '12px';
    remarksInput.style.border = '2px solid #007acc';
    remarksInput.style.borderRadius = '4px';
    remarksInput.style.resize = 'horizontal';
    remarksInput.style.overflow = 'hidden';
    remarksInput.style.backgroundColor = '#f8f9fa';
    
    // 拡張済みマークを設定
    remarksInput.dataset.expandedRemarks = 'true';
    remarksInput.dataset.originalWidth = originalWidth;
  }
}

// ページ全体のフォントを改善する機能
function improveFont() {
  // 既にフォント改善が適用されている場合はスキップ
  if (document.getElementById('kinnosuke-font-improvement')) return;
  
  const style = document.createElement("style");
  style.id = 'kinnosuke-font-improvement';
  style.textContent = EXTENSION_CONFIG.STYLES.IMPROVED_FONT;
  document.head.appendChild(style);
}

// 機能実行のマップ
const FEATURE_EXECUTORS = {
  showPopupContent: showPopupContent,
  hideColumns: (settings) => hideUnnecessaryColumns(settings.columnsToHide),
  removeHeaders: removeIntermediateHeaders,
  resizeImages: resizeImages,
  expandRemarks: expandRemarksInput,
  improveFont: improveFont,
};

// 出勤簿ページかどうかをチェック
function isAttendancePage() {
  const mainHeaderElements = document.querySelectorAll('td.main_header');
  
  for (let i = 0; i < mainHeaderElements.length; i++) {
    const element = mainHeaderElements[i];
    const headerText = element.textContent || '';
    
    if (headerText.includes('トップページ') && headerText.includes('出勤簿')) {
      return true;
    }
  }
  
  return false;
}

// メイン実行関数
function initializeExtension() {
  // 出勤簿ページでない場合は何もしない
  if (!isAttendancePage()) return;

  // 設定を読み込み
  chrome.storage.sync.get(Object.keys(DEFAULT_SETTINGS), function (result) {
    const settings = { ...DEFAULT_SETTINGS, ...result };

    // 全体が無効な場合は何もしない
    if (!settings.extensionEnabled) return;

    // 各機能を設定に基づいて実行
    Object.entries(FEATURE_EXECUTORS).forEach(([feature, executor]) => {
      if (settings[feature]) {
        try {
          executor(settings);
        } catch (error) {
          console.warn(
            `勤之助拡張機能: ${feature} の実行中にエラーが発生しました:`,
            error
          );
        }
      }
    });
  });
}

// 拡張機能を初期化
initializeExtension();
