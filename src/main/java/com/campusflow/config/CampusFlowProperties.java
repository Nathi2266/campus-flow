package com.campusflow.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "campusflow")
public class CampusFlowProperties {

    private final Auth auth = new Auth();
    private final Seed seed = new Seed();
    private final Bootstrap bootstrap = new Bootstrap();

    @Getter
    @Setter
    public static class Auth {
        private boolean registrationEnabled = true;
        private final RateLimit rateLimit = new RateLimit();

        @Getter
        @Setter
        public static class RateLimit {
            private int maxRequests = 20;
            private int windowSeconds = 60;
        }
    }

    @Getter
    @Setter
    public static class Seed {
        /** When true, Flyway also runs classpath:db/demo-seed (demo campus pack). */
        private boolean demo = false;
    }

    @Getter
    @Setter
    public static class Bootstrap {
        /** Create a first ADMIN when the users table is empty. */
        private boolean enabled = true;
        private String adminEmail = "";
        private String adminPassword = "";
        private String adminFirstName = "System";
        private String adminLastName = "Admin";
    }
}
