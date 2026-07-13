package com.example.slotsimulator.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.slotsimulator.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
    
    // 名前でユーザーを探す機能
    User findByUsername(String username);
    
    // ランキング用（差枚数が多い順にトップ10を取得）
    List<User> findTop10ByOrderByTotalDiffDesc();
}