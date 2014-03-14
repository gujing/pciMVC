package com.ccb.p2.transfer.util;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Created with IntelliJ IDEA.
 * User: Gin
 * Date: 13-2-19
 * Time: 上午9:36
 */
public class StringUtil {
    public static Integer getPureNumber(String src){
        Pattern pattern = Pattern.compile("No.\\d+");
        Matcher matcher = pattern.matcher(src);
        if (matcher.find()) {
            return Integer.valueOf(matcher.group().replaceAll("[^\\d]",""));
        }
        return -1;
    }

    public static String getPureString(String src) {
        return src.replace(".","");
    }

    public static String getPureInteger(String src){
        int pos = src.indexOf(".");
        if(pos > 0){
            return new Integer(src.substring(0,pos)).toString();
        }else{
            return "";
        }
    }

    public static Integer getTimesCount(String src){
        return Integer.valueOf(src.replaceAll("[^\\d]",""));
    }

    public static Integer getDotCount(String src){
        return src.replaceAll("[^\\.]","").length();
    }
    public static void main(String[] args) {
        System.out.println(getPureString("....UEEW"));
        System.out.println(getTimesCount("数..10..UEEW"));
        System.out.println(getPureNumber("数.No.1023..UEEW 20"));
        System.out.println(getDotCount("数.No.1023..UEEW 20"));
    }
}
