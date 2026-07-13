package com.example.slotsimulator.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    private int money;          // 所持金
    private int currentMedals;  // 【追加】現在の手持ちメダル
    private int totalDiff;      // 総差枚
    private int totalGameCount; // 【追加】総回転数
    
    // ゲームの状態
    private String gameState;       // NORMAL, AT, CZ
    private int czThroughCount;     // CZスルー回数
    private int atGameCount;        // 【追加】ATの残りゲーム数
    private int atContinuationCount;// 【追加】AT連チャン数

    public User() {
        this.money = 10000;
        this.currentMedals = 0;
        this.totalDiff = 0;
        this.totalGameCount = 0;
        this.gameState = "NORMAL";
        this.czThroughCount = 0;
        this.atGameCount = 0;
        this.atContinuationCount = 0;
    }

    // --- Getter / Setter ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public int getMoney() { return money; }
    public void setMoney(int money) { this.money = money; }

    public int getCurrentMedals() { return currentMedals; }
    public void setCurrentMedals(int currentMedals) { this.currentMedals = currentMedals; }

    public int getTotalDiff() { return totalDiff; }
    public void setTotalDiff(int totalDiff) { this.totalDiff = totalDiff; }

    public int getTotalGameCount() { return totalGameCount; }
    public void setTotalGameCount(int totalGameCount) { this.totalGameCount = totalGameCount; }

    public String getGameState() { return gameState; }
    public void setGameState(String gameState) { this.gameState = gameState; }

    public int getCzThroughCount() { return czThroughCount; }
    public void setCzThroughCount(int czThroughCount) { this.czThroughCount = czThroughCount; }

    public int getAtGameCount() { return atGameCount; }
    public void setAtGameCount(int atGameCount) { this.atGameCount = atGameCount; }

    public int getAtContinuationCount() { return atContinuationCount; }
    public void setAtContinuationCount(int atContinuationCount) { this.atContinuationCount = atContinuationCount; }
}