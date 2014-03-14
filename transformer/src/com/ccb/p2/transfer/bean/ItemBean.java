package com.ccb.p2.transfer.bean;

import java.util.ArrayList;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: Gin
 * Date: 14-3-14
 * Time: 下午1:34
 */
public class ItemBean {
    private String name;
    private String required;
    private String maxLength;
    private TypeStatus type;
    private String groupName;

    private List<ItemBean> children;

    public ItemBean(String name, TypeStatus type, String maxLength, String required) {
        this.name = name;
        this.type = type;
        this.maxLength = maxLength;
        this.required = required;

        if (type == TypeStatus.ARRAY || type == TypeStatus.GROUP) {
            children = new ArrayList<ItemBean>();
            this.groupName = name;
        }
    }

    public String getRequired() {
        return required;
    }

    public String getMaxLength() {
        return maxLength;
    }

    public String getName() {
        return name;
    }

    public TypeStatus getType() {
        return type;
    }

    public String getGroupName() {
        return groupName;
    }

    public List<ItemBean> getChildren() {
        return children;
    }

    public void addChildren(ItemBean itemBean) {
        children.add(itemBean);
    }
}
