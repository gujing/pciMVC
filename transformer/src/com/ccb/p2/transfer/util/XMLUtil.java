package com.ccb.p2.transfer.util;

import com.ccb.p2.transfer.bean.ItemBean;
import com.ccb.p2.transfer.bean.TypeStatus;
import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.dom4j.io.XMLWriter;

import java.io.FileWriter;
import java.io.IOException;
import java.io.Writer;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: Gin
 * Date: 13-2-18
 * Time: 上午11:05
 */
public class XMLUtil {
    /*private static String templateFilePath = PropertiesUtil.getTempDir() + "/responseTemplate.xml";

    public static void writePreDataFile(String serviceId, List<RowBean> requestBeans, List<RowBean> responseBeans){
        String preDataFilePath = "preTreatData/"+serviceId+".xml";

    }

    public static void writeResponseFile(String name, List<RowBean> rowBeans) {
        String responseFilPath = "output/"+name+".xml";

        String rootPath = "/TX/TX_BODY/ENTITY";
        Map pathMap = new HashMap();
        pathMap.put(0,rootPath);
        SAXReader reader = new SAXReader();
        try {
            Document document = reader.read(new File(templateFilePath));
            //用xpath查找对象
            for (RowBean rowBean : rowBeans) {
                insertRowBean(pathMap, rowBean, document);
            }

            XMLWriter output;
            OutputFormat format = OutputFormat.createPrettyPrint();
            try {
                output = new XMLWriter(new FileWriter(responseFilPath), format);
                output.write(document);
                output.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        } catch (DocumentException e) {
            e.printStackTrace();
        }

    }

    private static void insertRowBean(Map pathMap, RowBean rowBean, Document document) {
        String upperPath = (String) pathMap.get(rowBean.getLevel());
        List upperEntities = document.selectNodes(upperPath);
        if(rowBean.getType().equals("G")){
            pathMap.put(rowBean.getLevel()+1,upperPath + "/"+rowBean.getName());
            for (int i = 0, times = rowBean.getTimes(); i < times; i++) {
                insertElement(rowBean, upperEntities);
            }
            for(Object childrenBean : rowBean.getChildrenNode()){
                insertRowBean(pathMap, (RowBean) childrenBean, document);
            }
        }else {
            insertElement(rowBean, upperEntities);
        }
    }

    private static void insertElement(RowBean rowBean, List upperEntities) {
        for (Object upperEntity : upperEntities){
            Element node = ((Element)upperEntity).addElement(rowBean.getName());
            if(!rowBean.getType().equals("G")){
                node.addText("111");
            }
        }
    }*/

    private void addElementByBean(Element context, ItemBean itemBean){
        if (itemBean.getType() == TypeStatus.ITEM) {
            Element node = context.addElement("node");
            node.addElement("name").setText(itemBean.getName());
            node.addElement("type").setText("String");
            node.addElement("maxLength").setText(itemBean.getMaxLength());
            node.addElement("required").setText(itemBean.getRequired());
        }else if(itemBean.getType() == TypeStatus.GROUP || itemBean.getType() == TypeStatus.ARRAY){
            Element node = context.addElement("node");
            node.addElement("name").setText(itemBean.getName());
            node.addElement("type").setText("String");
            Element children = node.addElement("children");
            for(ItemBean bean: itemBean.getChildren()){
                addElementByBean(children, bean);
            }
        }
    }

    public Document parseItemBeans(List<ItemBean> itemBeans) {
        Document document = DocumentHelper.createDocument();

        Element root = document.addElement("root");
        for (ItemBean itemBean : itemBeans) {
            addElementByBean(root, itemBean);
        }
        return document;
    }

    public void writeXML(Document document){
        try {
            Writer fileWriter = new FileWriter("output/res.xml");
            XMLWriter xmlWriter = new XMLWriter(fileWriter);
            xmlWriter.write(document);
            xmlWriter.flush();
            xmlWriter.close();
        } catch (IOException e) {
            e.printStackTrace();
        }

    }

}
