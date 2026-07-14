package com.MakeMyTrip.makeMyTrip.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Document(collection = "hotel_room_types")
public class HotelRoomType {
    @Id
    private String _id;
    private String hotelId;
    private String name;
    private String description;
    private double pricePremium;
    private int available;
    private int total;
    private String imageSvg;
    private List<String> amenities;

    public String getId() { return _id; }
    public void setId(String id) { this._id = id; }
    public String getHotelId() { return hotelId; }
    public void setHotelId(String hotelId) { this.hotelId = hotelId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public double getPricePremium() { return pricePremium; }
    public void setPricePremium(double pricePremium) { this.pricePremium = pricePremium; }
    public int getAvailable() { return available; }
    public void setAvailable(int available) { this.available = available; }
    public int getTotal() { return total; }
    public void setTotal(int total) { this.total = total; }
    public String getImageSvg() { return imageSvg; }
    public void setImageSvg(String imageSvg) { this.imageSvg = imageSvg; }
    public List<String> getAmenities() { return amenities; }
    public void setAmenities(List<String> amenities) { this.amenities = amenities; }
}
