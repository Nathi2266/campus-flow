package com.campusflow.service;

import com.campusflow.domain.Notification;
import com.campusflow.domain.User;
import com.campusflow.dto.response.NotificationResponse;
import com.campusflow.dto.response.PagedResponse;
import com.campusflow.dto.response.UnreadCountResponse;
import com.campusflow.exception.NotFoundException;
import com.campusflow.repository.NotificationRepository;
import com.campusflow.repository.UserRepository;
import com.campusflow.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SecurityUtils securityUtils;

    /** Persist an in-app notification when the recipient allows delivery (own TX so failures still notify). */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void notifyUser(User recipient, String type, String title, String body,
                           String entityType, Long entityId) {
        if (recipient == null || recipient.getId() == null) {
            return;
        }
        User managed = userRepository.findById(recipient.getId()).orElse(null);
        if (managed == null || !Boolean.TRUE.equals(managed.getNotifyInApp())) {
            return;
        }
        notificationRepository.save(Notification.builder()
            .user(managed)
            .type(type)
            .title(title)
            .body(body)
            .entityType(entityType)
            .entityId(entityId)
            .build());
    }

    @Transactional(readOnly = true)
    public PagedResponse<NotificationResponse> listMine(Integer page, Integer size) {
        User user = securityUtils.getCurrentUser();
        int p = page != null && page >= 0 ? page : 0;
        int s = size != null && size > 0 ? Math.min(size, 100) : 20;
        Pageable pageable = PageRequest.of(p, s);
        Page<Notification> result = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable);
        return PagedResponse.<NotificationResponse>builder()
            .content(result.getContent().stream().map(this::toResponse).toList())
            .page(result.getNumber())
            .size(result.getSize())
            .totalElements(result.getTotalElements())
            .totalPages(result.getTotalPages())
            .isFirst(result.isFirst())
            .isLast(result.isLast())
            .hasContent(result.hasContent())
            .build();
    }

    @Transactional(readOnly = true)
    public UnreadCountResponse unreadCount() {
        User user = securityUtils.getCurrentUser();
        return UnreadCountResponse.builder()
            .count(notificationRepository.countByUserIdAndReadAtIsNull(user.getId()))
            .build();
    }

    public NotificationResponse markRead(Long id) {
        User user = securityUtils.getCurrentUser();
        Notification notification = notificationRepository.findByIdAndUserId(id, user.getId())
            .orElseThrow(() -> new NotFoundException("Notification not found", "id"));
        if (notification.getReadAt() == null) {
            notification.setReadAt(OffsetDateTime.now());
            notificationRepository.save(notification);
        }
        return toResponse(notification);
    }

    public void markAllRead() {
        User user = securityUtils.getCurrentUser();
        notificationRepository.markAllRead(user.getId(), OffsetDateTime.now());
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
            .id(n.getId())
            .type(n.getType())
            .title(n.getTitle())
            .body(n.getBody())
            .entityType(n.getEntityType())
            .entityId(n.getEntityId())
            .readAt(n.getReadAt())
            .createdAt(n.getCreatedAt())
            .unread(n.getReadAt() == null)
            .build();
    }
}
