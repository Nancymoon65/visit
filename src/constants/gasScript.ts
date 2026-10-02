export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * ==============================================================
 * [시트로그 SheetLog] 구글 스프레드시트 방명록 Web App API
 * ==============================================================
 * 
 * 💡 본 코드는 브라우저(웹앱)에서 구글 시트에 방명록을
 * 읽고(GET) 쓰기(POST) 위한 구글 앱스 스크립트(Google Apps Script) 코드입니다.
 * 
 * [배포 시 필수 체크사항]
 * 1. 상단 메뉴 [배포] > [새 배포] 클릭
 * 2. 유형: '웹 앱' 선택
 * 3. 다음 사용자 권한으로 실행: '나(내 Google 계정)'
 * 4. 액세스 권한: '모든 사용자(Anyone)'  <-- 반드시 선택!
 * 5. 생성된 '웹 앱 URL'을 복사하여 웹앱 설정에 붙여넣으세요.
 */

// 1. 데이터 읽기 (GET 요청 처리)
function doGet(e) {
  try {
    var sheet = getOrCreateSheet();

    // GET 파라미터로 글쓰기(fallback) 요청이 들어온 경우 처리
    if (e && e.parameter && (e.parameter.action === "write" || e.parameter.message)) {
      return handleWrite(e.parameter);
    }

    // 시트의 모든 데이터 가져오기
    var rows = sheet.getDataRange().getValues();
    var entries = [];

    // 1행(헤더) 건너뛰고 2행부터 객체로 변환
    if (rows && rows.length > 1) {
      for (var i = 1; i < rows.length; i++) {
        var row = rows[i];
        // 빈 행이 아닐 경우만 추가
        if (row[0] || row[1] || row[2]) {
          var dateVal = row[0];
          var isoDate = (dateVal instanceof Date) 
            ? dateVal.toISOString() 
            : (dateVal ? String(dateVal) : new Date().toISOString());

          entries.push({
            id: row[4] ? String(row[4]) : ("row_" + i),
            timestamp: isoDate,
            name: String(row[1] || "익명"),
            message: String(row[2] || ""),
            tag: String(row[3] || "응원·격려")
          });
        }
      }
    }

    // 최신 등록순으로 정렬
    entries.reverse();

    var response = {
      status: "success",
      count: entries.length,
      data: entries,
      serverTime: new Date().toISOString()
    };

    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 2. 데이터 등록 (POST 요청 처리)
function doPost(e) {
  try {
    var data = {};

    // JSON 형식 바디 또는 URL 폼 파라미터 파싱
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (parseError) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    return handleWrite(data);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 3. 공통 쓰기 처리 로직
function handleWrite(data) {
  var sheet = getOrCreateSheet();

  var name = (data.name || "").toString().trim() || "익명 친구";
  var message = (data.message || "").toString().trim();
  var tag = (data.tag || "응원·격려").toString().trim();

  if (!message) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        message: "메시지 내용이 비어있습니다."
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var now = new Date();
  var id = "entry_" + now.getTime() + "_" + Math.floor(Math.random() * 1000);

  // 스프레드시트 다음 빈 줄에 한 행 추가
  // [A:등록일시, B:이름, C:응원메시지, D:태그, E:고유ID]
  sheet.appendRow([now, name, message, tag, id]);

  var result = {
    status: "success",
    message: "방명록이 등록되었습니다.",
    data: {
      id: id,
      timestamp: now.toISOString(),
      name: name,
      message: message,
      tag: tag
    }
  };

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// 4. 시트 자동 준비 및 첫 행 헤더 스타일링
function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("방명록") || ss.getActiveSheet();

  // 첫 번째 행이 비어있으면 헤더 작성 및 꾸미기
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["등록일시", "이름", "응원메시지", "태그", "고유ID"]);
    var headerRange = sheet.getRange(1, 1, 1, 5);
    headerRange.setBackground("#0F9D58"); // 구글 시트 에메랄드 그린
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontWeight("bold");
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 180); // 등록일시
    sheet.setColumnWidth(2, 120); // 이름
    sheet.setColumnWidth(3, 380); // 메시지
    sheet.setColumnWidth(4, 110); // 태그
    sheet.setColumnWidth(5, 140); // 고유ID
  }

  return sheet;
}

/**
 * ==============================================================
 * [부록] 🤖 구글 시트 AI 할일 관리 커스텀 메뉴
 * ==============================================================
 * 시트 상단 메뉴바에 [🤖 AI 할일 관리] 메뉴를 추가하고,
 * '할일목록' 시트의 할 일을 자동으로 분석/정리합니다.
 */

// 구글 시트가 열릴 때 상단에 커스텀 메뉴 추가
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🤖 AI 할일 관리')
    .addItem('할 일 분석 및 스마트 정리', 'analyzeTasksSmart')
    .addToUi();
}

// 할 일 분석 및 우선순위/세부단계 일괄 정리 함수 (초고속 배치 처리)
function analyzeTasksSmart() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("할일목록");

  // 시트가 없으면 자동 생성 및 헤더 서식 설정
  if (!sheet) {
    sheet = ss.insertSheet("할일목록");
    sheet.appendRow(["상태", "할 일 내용", "우선순위", "AI 세부 실행 단계"]);
    var header = sheet.getRange(1, 1, 1, 4);
    header.setBackground("#1A73E8");
    header.setFontColor("#FFFFFF");
    header.setFontWeight("bold");
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 80);
    sheet.setColumnWidth(2, 280);
    sheet.setColumnWidth(3, 110);
    sheet.setColumnWidth(4, 340);
    SpreadsheetApp.getUi().alert("'할일목록' 시트가 새로 생성되었습니다!\\nB열에 할 일을 적은 뒤 다시 실행해보세요.");
    return;
  }

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert("분석할 할 일이 없습니다. (2행부터 할 일을 입력해주세요)");
    return;
  }

  // 전체 데이터 일괄 읽기 (A열~D열)
  var range = sheet.getRange(2, 1, lastRow - 1, 4);
  var values = range.getValues();
  var updatedCount = 0;

  for (var i = 0; i < values.length; i++) {
    var status = String(values[i][0]).trim(); // A열: 상태
    var task = String(values[i][1]).trim();   // B열: 할 일

    if (task && status !== "완료") {
      var priority = "보통";
      var steps = "1. 목표 정의 및 리소스 확인\\n2. 세부 실행 및 점검";

      if (/긴급|당일|오늘|ASAP|급함|마감/i.test(task)) {
        priority = "🔴 긴급";
        steps = "1. 방해 요소 차단 및 즉시 착수\\n2. 핵심 작업 우선 완수\\n3. 마감 전 최종 검토";
      } else if (/보고서|기획|문서|분석|제안/i.test(task)) {
        priority = "🟠 높음";
        steps = "1. 핵심 자료 조사 및 개요 작성\\n2. 본문 초안 작성\\n3. 검토 및 피드백 반영";
      } else if (/회의|미팅|면담|통화/i.test(task)) {
        priority = "🟡 보통";
        steps = "1. 아젠다 및 참석자 확인\\n2. 미팅 진행\\n3. 액션아이템 공유";
      } else if (/정리|청소|쇼핑|구매|운동/i.test(task)) {
        priority = "🟢 낮음";
        steps = "1. 준비물 및 공간 체크\\n2. 집중 실행";
      }

      values[i][2] = priority;
      values[i][3] = steps;
      updatedCount++;
    }
  }

  // 일괄 쓰기
  range.setValues(values);
  SpreadsheetApp.getUi().alert("총 " + updatedCount + "개의 할 일 정리가 완료되었습니다! 🎉");
}
`;
