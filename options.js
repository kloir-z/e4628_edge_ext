// デフォルト設定
const defaultSettings = {
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
    "退社３"
  ]
};

// 変更検知用の状態
let hasUnsavedChanges = false;
let originalSettings = {};

// 設定を読み込み
function loadOptions() {
  chrome.storage.sync.get(Object.keys(defaultSettings), function(result) {
    const settings = { ...defaultSettings, ...result };
    
    // 元の設定を保存（変更検知用）
    originalSettings = { ...settings };
    
    // チェックボックスの状態を設定
    document.getElementById('extensionEnabled').checked = settings.extensionEnabled;
    document.getElementById('showPopupContent').checked = settings.showPopupContent;
    document.getElementById('hideColumns').checked = settings.hideColumns;
    document.getElementById('removeHeaders').checked = settings.removeHeaders;
    document.getElementById('resizeImages').checked = settings.resizeImages;
    document.getElementById('expandRemarks').checked = settings.expandRemarks;
    document.getElementById('improveFont').checked = settings.improveFont;
    
    // 列設定を設定
    document.getElementById('columnsToHide').value = settings.columnsToHide.join('\n');
    
    // 列設定セクションの表示/非表示を制御
    toggleColumnsSection();
    
    // 変更検知のイベントリスナーを設定
    setupChangeDetection();
    
    // 初期状態では未保存の変更はない
    setUnsavedChanges(false);
  });
}

// 設定を保存
function saveOptions() {
  const columnsToHide = document.getElementById('columnsToHide').value
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  const settings = {
    extensionEnabled: document.getElementById('extensionEnabled').checked,
    showPopupContent: document.getElementById('showPopupContent').checked,
    hideColumns: document.getElementById('hideColumns').checked,
    removeHeaders: document.getElementById('removeHeaders').checked,
    resizeImages: document.getElementById('resizeImages').checked,
    expandRemarks: document.getElementById('expandRemarks').checked,
    improveFont: document.getElementById('improveFont').checked,
    columnsToHide: columnsToHide
  };
  
  chrome.storage.sync.set(settings, function() {
    showStatus('設定が保存されました', 'success');
    // 保存後は未保存の変更はない
    originalSettings = { ...settings };
    setUnsavedChanges(false);
  });
}

// デフォルトに戻す
function resetOptions() {
  // フォームをデフォルト値にリセット
  document.getElementById('extensionEnabled').checked = defaultSettings.extensionEnabled;
  document.getElementById('showPopupContent').checked = defaultSettings.showPopupContent;
  document.getElementById('hideColumns').checked = defaultSettings.hideColumns;
  document.getElementById('removeHeaders').checked = defaultSettings.removeHeaders;
  document.getElementById('resizeImages').checked = defaultSettings.resizeImages;
  document.getElementById('expandRemarks').checked = defaultSettings.expandRemarks;
  document.getElementById('improveFont').checked = defaultSettings.improveFont;
  document.getElementById('columnsToHide').value = defaultSettings.columnsToHide.join('\n');
  
  // ストレージにデフォルト設定を保存
  chrome.storage.sync.set(defaultSettings, function() {
    showStatus('デフォルト設定に戻しました', 'success');
    toggleColumnsSection();
    // リセット後は未保存の変更はない
    originalSettings = { ...defaultSettings };
    setUnsavedChanges(false);
  });
}

// 列設定セクションの表示/非表示を切り替え
function toggleColumnsSection() {
  const hideColumnsEnabled = document.getElementById('hideColumns').checked;
  const columnsSection = document.getElementById('columnsSection');
  columnsSection.style.display = hideColumnsEnabled ? 'block' : 'none';
}

// ステータスメッセージを表示
function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = `status ${type}`;
  status.style.display = 'block';
  
  setTimeout(() => {
    status.style.display = 'none';
  }, 3000);
}

// 未保存の変更があるかどうかの表示を更新
function setUnsavedChanges(hasChanges) {
  hasUnsavedChanges = hasChanges;
  const prompt = document.getElementById('unsavedPrompt');
  const saveButton = document.getElementById('save');
  
  if (hasChanges) {
    prompt.style.display = 'block';
    saveButton.classList.add('save-highlight');
  } else {
    prompt.style.display = 'none';
    saveButton.classList.remove('save-highlight');
  }
}

// 現在の設定値を取得
function getCurrentSettings() {
  const columnsToHide = document.getElementById('columnsToHide').value
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  return {
    extensionEnabled: document.getElementById('extensionEnabled').checked,
    showPopupContent: document.getElementById('showPopupContent').checked,
    hideColumns: document.getElementById('hideColumns').checked,
    removeHeaders: document.getElementById('removeHeaders').checked,
    resizeImages: document.getElementById('resizeImages').checked,
    expandRemarks: document.getElementById('expandRemarks').checked,
    improveFont: document.getElementById('improveFont').checked,
    columnsToHide: columnsToHide
  };
}

// 設定が変更されたかどうかをチェック
function checkForChanges() {
  const currentSettings = getCurrentSettings();
  
  // 設定を比較
  const hasChanges = JSON.stringify(currentSettings) !== JSON.stringify(originalSettings);
  setUnsavedChanges(hasChanges);
}

// 変更検知のイベントリスナーを設定
function setupChangeDetection() {
  const checkboxes = ['extensionEnabled', 'showPopupContent', 'hideColumns', 'removeHeaders', 'resizeImages', 'expandRemarks', 'improveFont'];
  
  checkboxes.forEach(id => {
    document.getElementById(id).addEventListener('change', checkForChanges);
  });
  
  document.getElementById('columnsToHide').addEventListener('input', checkForChanges);
}

// イベントリスナーを設定
document.addEventListener('DOMContentLoaded', function() {
  loadOptions();
  
  document.getElementById('save').addEventListener('click', saveOptions);
  document.getElementById('reset').addEventListener('click', resetOptions);
  
  // 列非表示設定の変更時に表示を切り替え
  document.getElementById('hideColumns').addEventListener('change', toggleColumnsSection);
});

// エラーハンドリング
chrome.runtime.onConnect.addListener(function(port) {
  port.onDisconnect.addListener(function() {
    if (chrome.runtime.lastError) {
      showStatus('設定の保存中にエラーが発生しました', 'error');
    }
  });
});