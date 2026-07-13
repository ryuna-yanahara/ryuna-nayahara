package com.example.slotsimulator.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.slotsimulator.model.User;
import com.example.slotsimulator.repository.UserRepository;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class GameController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public User login(@RequestParam String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            user = new User();
            user.setUsername(username);
            userRepository.save(user);
        }
        return user;
    }

    @PostMapping("/save")
    public String saveGame(@RequestBody User updatedUser) {
        User existingUser = userRepository.findById(updatedUser.getId()).orElse(null);
        if (existingUser != null) {
            existingUser.setMoney(updatedUser.getMoney());
            existingUser.setCurrentMedals(updatedUser.getCurrentMedals()); // 追加
            existingUser.setTotalDiff(updatedUser.getTotalDiff());
            existingUser.setTotalGameCount(updatedUser.getTotalGameCount()); // 追加
            
            existingUser.setGameState(updatedUser.getGameState());
            existingUser.setCzThroughCount(updatedUser.getCzThroughCount());
            existingUser.setAtGameCount(updatedUser.getAtGameCount()); // 追加
            existingUser.setAtContinuationCount(updatedUser.getAtContinuationCount()); // 追加
            
            userRepository.save(existingUser);
            return "Saved";
        }
        return "Error";
    }

    @GetMapping("/ranking")
    public List<User> getRanking() {
        return userRepository.findTop10ByOrderByTotalDiffDesc();
    }
}