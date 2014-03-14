package com.ccb.p2.transfer;

import java.io.UnsupportedEncodingException;
import java.util.Date;
import java.util.Random;

/**
 * Created with IntelliJ IDEA.
 * User: Gin
 * Date: 14-3-11
 * Time: 下午2:29
 */
public class TestDataGenerator {

    private static Random random = null;

    private static Random getRandomInstance() {
        if (random == null) {
            random = new Random(new Date().getTime());
        }
        return random;
    }

    private String getChineseChar(){
        String str = null;
        int highPos, lowPos;
        Random random = getRandomInstance();
        highPos = (176 + Math.abs(random.nextInt(39)));
        lowPos = 161 + Math.abs(random.nextInt(93));
        byte[] b = new byte[2];
        b[0] = (new Integer(highPos)).byteValue();
        b[1] = (new Integer(lowPos)).byteValue();
        try {
            str = new String(b, "GB2312");
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }
        return str;
    }

    public static void main(String[] args) {
        TestDataGenerator generator = new TestDataGenerator();
        System.out.println(generator.getChineseChar());
        System.out.println(generator.getChineseChar());
        System.out.println(generator.getChineseChar());
        System.out.println(generator.getChineseChar());
    }
}
