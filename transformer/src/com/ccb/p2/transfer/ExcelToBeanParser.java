package com.ccb.p2.transfer;

import com.ccb.p2.transfer.bean.ItemBean;
import com.ccb.p2.transfer.bean.TaskStatus;
import com.ccb.p2.transfer.bean.TypeStatus;
import com.ccb.p2.transfer.util.XMLUtil;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.ccb.p2.transfer.util.StringUtil.getDotCount;
import static com.ccb.p2.transfer.util.StringUtil.getPureInteger;
import static com.ccb.p2.transfer.util.StringUtil.getPureString;

/**
 * Created with IntelliJ IDEA.
 * User: Gin
 * Date: 14-3-14
 * Time: 上午11:24
 */
public class ExcelToBeanParser {
    private final Integer ENG_NAME = 0;
    private final Integer FIELD_LENGTH = 3;
    private final Integer REQUIRED = 4;
    private final Integer TYPE = 5;
    private TaskStatus taskStatus;
    private List<ItemBean> requestFields = new ArrayList<ItemBean>(10);
    private List<ItemBean> responsetFields = new ArrayList<ItemBean>(10);
    private ItemBean currentGroupItem;
    private Integer currentLevel = 0;
    private Map<Integer, ItemBean> currentGroupMap = new HashMap<Integer, ItemBean>(10);

    private boolean isEmptyRow(Row row) {
        return isEmptyCell(row.getCell(ENG_NAME)) && isEmptyCell(row.getCell(FIELD_LENGTH))
                && isEmptyCell(row.getCell(REQUIRED));
    }

    private boolean isEmptyCell(Cell cell) {
        return null == cell || getCellValue(cell).equals("");
    }

    private String getCellValue(Cell cell) {
        String value = "";
        try {
            switch (cell.getCellType()) {
                case XSSFCell.CELL_TYPE_NUMERIC:
                    value = "" + cell.getNumericCellValue();
                    break;
                case XSSFCell.CELL_TYPE_STRING:
                    value = cell.getStringCellValue();
                    break;
                default:
            }
        } catch (Exception e) {
            //
        }
        return value;
    }

    private void readExcel(String fileName) {
        requestFields.clear();
        responsetFields.clear();
        File file = new File(fileName);
        try {
            FileInputStream fis = new FileInputStream(file);
            XSSFWorkbook workBook = new XSSFWorkbook(fis);
            XSSFSheet sheet = workBook.getSheetAt(0);//按索引号取得sheet1

            fis.close();

            for (Row row : sheet) {
                if (isEmptyRow(row)) {
                    continue;
                }
                if (!isEmptyCell(row.getCell(ENG_NAME)) && getCellValue(row.getCell(ENG_NAME)).startsWith("请求报文")) {
                    taskStatus = TaskStatus.REQUEST;
                    continue;
                }
                if (!isEmptyCell(row.getCell(ENG_NAME)) && getCellValue(row.getCell(ENG_NAME)).startsWith("响应报文")) {
                    taskStatus = TaskStatus.RESPONSE;
                    continue;
                }
                if (!isEmptyCell(row.getCell(ENG_NAME)) && getCellValue(row.getCell(ENG_NAME)).startsWith("栏位项目名称")) {
                    continue;
                }
                switch (taskStatus) {
                    case REQUEST:
                        insetRequestFields(row);
                        break;
                    case RESPONSE:
//                        if (insertResponseFields(row)) continue;
                        break;
                    default:
                }
            }
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException ioe) {
            ioe.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private Integer getItemLevel(Row row) {
        return getDotCount(getCellValue(row.getCell(ENG_NAME))) / 2;
    }

    private TypeStatus getTypeStatus(Row row) {
        String type = getCellValue(row.getCell(TYPE));
        if (type.startsWith("G")) {
            return TypeStatus.GROUP;
        } else if (type.startsWith("A")) {
            return TypeStatus.ARRAY;
        } else {
            return TypeStatus.ITEM;
        }
    }

    private String getRequired(Row row) {
        if (getPureString(getCellValue(row.getCell(REQUIRED))).equals("Y")) {
            return "true";
        } else {
            return "false";
        }
    }

    private void insetRequestFields(Row row) throws Exception {
        ItemBean itemBean = new ItemBean(getPureString(getCellValue(row.getCell(ENG_NAME))), getTypeStatus(row),
                getPureInteger(getCellValue(row.getCell(FIELD_LENGTH))), getRequired(row));
        if (itemBean.getGroupName() != null) {
            if (getItemLevel(row) == currentLevel + 1) {
                currentGroupItem = itemBean;
                currentGroupMap.get(currentLevel).addChildren(itemBean);
                currentLevel = getItemLevel(row);
            } else if (getItemLevel(row) <= currentLevel) {
                currentGroupMap.put(getItemLevel(row), itemBean);
                currentLevel = getItemLevel(row);
                requestFields.add(itemBean);
            } else {
                throw new Exception(itemBean.getGroupName() + "所属层级有误");
            }
        } else {
            if (getItemLevel(row) == currentLevel + 1) {
                currentGroupMap.get(currentLevel).addChildren(itemBean);
            } else if (getItemLevel(row) == 0) {
                requestFields.add(itemBean);
            } else {
                throw new Exception(itemBean.getGroupName() + "所属层级有误");
            }
        }
    }

    public List<ItemBean> getRequestFields() {
        return requestFields;
    }

    public List<ItemBean> getResponsetFields() {
        return responsetFields;
    }

    public static void main(String[] args) {
        ExcelToBeanParser excelToBeanParser = new ExcelToBeanParser();

        XMLUtil xmlUtil = new XMLUtil();

        String inputFolder = args[0];
        String outputFolder = args[1];
        File dir = new File(inputFolder);
        if(dir.isDirectory()){
            File[] files = dir.listFiles();
            for(File file : files){
                System.out.println(file.getName().split("\\.")[0]);
                System.out.println(file.getAbsolutePath());
                excelToBeanParser.readExcel(inputFolder + "/" + file.getName());
                xmlUtil.writeXML(xmlUtil.parseItemBeans(excelToBeanParser.getRequestFields()),
                        outputFolder +"/"+file.getName().split("\\.")[0]+".xml");
            }
        }
    }
}

